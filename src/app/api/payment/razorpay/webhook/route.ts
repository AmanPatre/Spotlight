import { NextResponse } from "next/server";
import crypto from "crypto";
import { prismaClient } from "@/lib/prismaClient";

/**
 * POST /api/payment/razorpay/webhook
 * Handles Razorpay webhook events.
 * 
 * Primary use case: When a host purchases a 30-day Pro Pass,
 * Razorpay fires an `order.paid` event. This webhook catches it,
 * verifies the signature, and activates the user's Pro status.
 * 
 * Also handles `payment.captured` for attendee purchases as a 
 * server-side fallback (in case the client-side verify fails).
 */
export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret || !signature) {
            return NextResponse.json(
                { error: "Missing webhook secret or signature" },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret || "")
            .update(rawBody)
            .digest("hex");

        console.log("[Webhook] Signature Check:", {
            received: signature,
            expected: expectedSignature,
            match: signature === expectedSignature,
            secretLength: webhookSecret?.length
        });

        if (expectedSignature !== signature) {
            console.error("[Webhook] Signature mismatch!");
            return NextResponse.json(
                { error: "Invalid webhook signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(rawBody);
        const eventId = event.id;

        // Idempotency check — prevent duplicate processing
        if (eventId) {
            const existingWebhook = await prismaClient.processedWebhook.findUnique({
                where: { eventId },
            });

            if (existingWebhook) {
                return NextResponse.json(
                    { message: "Event already processed" },
                    { status: 200 }
                );
            }
        }

        // ==========================================
        // HANDLE: order.paid — SaaS Pro Pass Purchase
        // ==========================================
        if (event.event === "order.paid") {
            const order = event.payload?.order?.entity;
            const payment = event.payload?.payment?.entity;

            // Look for email in Order notes, Payment notes, or Payment direct field
            const email = order?.notes?.email || payment?.notes?.email || payment?.email;

            if (email) {
                // Find the user by email and activate their Pro status
                const user = await prismaClient.user.findUnique({
                    where: { email },
                });

                if (user) {
                    const proExpiresAt = new Date();
                    proExpiresAt.setDate(proExpiresAt.getDate() + 30);

                    await prismaClient.user.update({
                        where: { id: user.id },
                        data: {
                            isPro: true,
                            subscription: true,
                            proExpiresAt,
                        },
                    });

                    console.log(`[Webhook] Pro Pass activated for ${email}, expires ${proExpiresAt.toISOString()}`);
                }
            }
        }

        // ==========================================
        // HANDLE: payment.captured — Attendee Purchase (fallback)
        // ==========================================
        if (event.event === "payment.captured") {
            const payment = event.payload?.payment?.entity;
            const { attendeeId, webinarId } = payment?.notes || {};

            if (attendeeId && webinarId) {
                const { AttendedTypeEnum } = await import("@prisma/client");

                await prismaClient.attendance.upsert({
                    where: {
                        attendeeId_webinarId: { attendeeId, webinarId },
                    },
                    update: {
                        attendedType: AttendedTypeEnum.CONVERTED,
                    },
                    create: {
                        attendeeId,
                        webinarId,
                        attendedType: AttendedTypeEnum.CONVERTED,
                    },
                });
            }
        }

        // Record the event as processed
        if (eventId) {
            await prismaClient.processedWebhook.create({
                data: { eventId },
            });
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: unknown) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing error" },
            { status: 500 }
        );
    }
}
