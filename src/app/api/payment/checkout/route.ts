import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "@prisma/client";

/**
 * POST /api/payment/checkout
 * Simulated (fake) payment — no real Stripe needed.
 * Marks the attendee as CONVERTED in the Attendance table.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { attendeeId, webinarId } = body as {
            attendeeId: string;
            webinarId: string;
        };

        if (!attendeeId || !webinarId) {
            return NextResponse.json(
                { success: false, error: "attendeeId and webinarId are required" },
                { status: 400 }
            );
        }

        // Confirm the attendance record exists
        const attendance = await prismaClient.attendance.findUnique({
            where: { attendeeId_webinarId: { attendeeId, webinarId } },
        });

        if (!attendance) {
            return NextResponse.json(
                { success: false, error: "Attendance record not found" },
                { status: 404 }
            );
        }

        // Mark as CONVERTED (simulated successful purchase)
        await prismaClient.attendance.update({
            where: { attendeeId_webinarId: { attendeeId, webinarId } },
            data: { attendedType: AttendedTypeEnum.CONVERTED },
        });

        // Clear dashboard leads cache
        import("next/cache").then(({ revalidatePath }) => {
            revalidatePath("/lead");
            revalidatePath("/webinars/[webinarid]", "layout");
        });

        // Generate a fake order ID for the receipt
        const orderId = `FAKE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        return NextResponse.json({ success: true, orderId });
    } catch (error) {
        console.error("[payment/checkout] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
