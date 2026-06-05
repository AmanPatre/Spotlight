import { NextResponse } from "next/server";
import crypto from "crypto";
import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "@prisma/client";

/**
 * POST /api/payment/razorpay/verify
 * Verifies Razorpay payment signature after successful checkout.
 * Marks the attendee as CONVERTED in the database.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            webinarId,
            attendeeId,
        } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return NextResponse.json(
                { success: false, error: "Missing Razorpay secret" },
                { status: 500 }
            );
        }

        // Verify the signature using HMAC SHA256
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Payment verified — mark attendee as CONVERTED
        if (attendeeId && webinarId) {
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

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Verification error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
