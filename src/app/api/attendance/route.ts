import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "@/generated/prisma/enums";

/**
 * PATCH /api/attendance
 * Client-side callable route to update an attendee's pipeline status.
 * Used by the Vapi call component to mark "AI Call started/ended".
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { attendeeId, webinarId, status } = body as {
            attendeeId: string;
            webinarId: string;
            status: AttendedTypeEnum;
        };

        if (!attendeeId || !webinarId || !status) {
            return NextResponse.json(
                { success: false, error: "attendeeId, webinarId, and status are required" },
                { status: 400 }
            );
        }

        // Only allow valid enum values
        const validStatuses = Object.values(AttendedTypeEnum);
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status: ${status}` },
                { status: 400 }
            );
        }

        await prismaClient.attendance.update({
            where: { attendeeId_webinarId: { attendeeId, webinarId } },
            data: { attendedType: status },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[attendance PATCH] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
