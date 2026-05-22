"use server";

import { prismaClient } from "@/lib/prismaClient";

export const getWebinarDebriefs = async (webinarId: string) => {
    try {
        const debriefs = await prismaClient.callDebrief.findMany({
            where: {
                attendance: {
                    webinarId,
                },
            },
            include: {
                attendance: {
                    select: {
                        attendeeId: true,
                    },
                },
            },
        });

        return { success: true, debriefs };
    } catch (error) {
        console.error("Failed to fetch debriefs", error);
        return { success: false, error: "Failed to fetch debriefs" };
    }
};
