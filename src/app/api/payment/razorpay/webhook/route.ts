import { NextResponse } from "next/server";
import crypto from "crypto";
import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "@/generated/prisma/enums";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret || !signature) {
            return NextResponse.json({ error: "Missing secret or signature" }, { status: 400 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(rawBody);
        const eventId = event.id; // Razorpay event ID

        if (eventId) {
            // Check if this webhook event was already processed
            const existingWebhook = await prismaClient.processedWebhook.findUnique({
                where: { eventId }
            });

            if (existingWebhook) {
                return NextResponse.json({ message: "Event already processed" }, { status: 200 });
            }
        }

        // Handle payment.captured event
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            // We assume you pass attendeeId and webinarId in notes during order creation or checkout
            // For Razorpay Checkout, passing notes is very easy in the frontend options.
            const { attendeeId, webinarId } = payment.notes;

            if (attendeeId && webinarId) {
                // ==========================================
                // PAYMENT FULFILLMENT LOGIC
                // Update attendee status to CONVERTED
                // ==========================================
                await prismaClient.attendance.update({
                    where: {
                        attendeeId_webinarId: {
                            attendeeId,
                            webinarId
                        }
                    },
                    data: {
                        attendedType: AttendedTypeEnum.CONVERTED
                    }
                });
            }
        }

        // Save the event ID to prevent duplicate processing
        if (eventId) {
            await prismaClient.processedWebhook.create({
                data: { eventId }
            });
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Webhook verification error:", error);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
}
