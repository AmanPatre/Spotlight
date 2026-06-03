"use client";

import { useEffect, useRef } from "react";
import { Call } from "@stream-io/video-react-sdk";

type Props = {
    videoUrl: string;
    isHost: boolean;
    call: Call;
};

export default function SyncVideoPlayer({ videoUrl, isHost, call }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Sync logic for Attendees
    useEffect(() => {
        if (!call || isHost) return;

        const unsubscribe = call.on("custom", (event: any) => {
            if (event.custom?.type === "VIDEO_SYNC") {
                const video = videoRef.current;
                if (!video) return;

                const { action, time } = event.custom;

                if (action === "play") {
                    // Seek if desynced by more than 1 second
                    if (Math.abs(video.currentTime - time) > 1) {
                        video.currentTime = time;
                    }
                    video.play().catch(console.error);
                } else if (action === "pause") {
                    video.currentTime = time;
                    video.pause();
                } else if (action === "seek") {
                    video.currentTime = time;
                }
            }
        });

        return () => unsubscribe();
    }, [call, isHost]);

    // Emit events if Host
    const handleHostEvent = (action: string) => {
        if (!isHost || !call || !videoRef.current) return;
        call.sendCustomEvent({
            type: "VIDEO_SYNC",
            action: action,
            time: videoRef.current.currentTime,
        });
    };

    return (
        <video
            ref={videoRef}
            src={videoUrl}
            controls={isHost}
            className="w-full h-full object-contain bg-black rounded-lg"
            onPlay={() => handleHostEvent("play")}
            onPause={() => handleHostEvent("pause")}
            onSeeked={() => handleHostEvent("seek")}
            playsInline
            muted={isHost} // Prevents echo for the host, attendees will hear it
        />
    );
}
