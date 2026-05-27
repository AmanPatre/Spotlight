import { NextResponse } from "next/server";
import crypto from "crypto";
import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "@prisma/client";

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
        if (!secret) throw new Error("Missing razorpay secret");

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment verified! Update the database for localhost testing
            if (attendeeId && webinarId) {
                await prismaClient.attendance.update({
                    where: {
                        attendeeId_webinarId: { attendeeId, webinarId },
                    },
                    data: {
                        attendedType: AttendedTypeEnum.CONVERTED,
                    },
                });
            }
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
        }
    } catch (error: unknown) {
        console.error("Verification error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
