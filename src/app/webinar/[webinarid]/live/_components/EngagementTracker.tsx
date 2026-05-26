"use client";

import { useEffect, useRef } from "react";
import { updateWatchTime } from "@/actions/attendence";

type Props = {
    webinarId: string;
    attendeeId: string;
};

export default function EngagementTracker({ webinarId, attendeeId }: Props) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const heartBeatInterval = 30000; // 30 seconds

    useEffect(() => {
        // Start heart-beat to track session duration
        intervalRef.current = setInterval(async () => {
            try {
                await updateWatchTime(webinarId, attendeeId, heartBeatInterval / 1000);
            } catch (error) {
                console.error("Failed to heart-beat watch time", error);
            }
        }, heartBeatInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [webinarId, attendeeId]);

    return null; // This is a headless component for tracking logic only
}
