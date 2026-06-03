"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Monitor, MonitorOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ScreenShareButton() {
    const { useScreenShareState } = useCallStateHooks();
    const { screenShare, isMute: isNotSharing } = useScreenShareState();
    const isSharing = !isNotSharing;
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // When the browser's native "Stop sharing" button is clicked,
    // the SDK fires track ended and sets the state automatically.
    // We don't need to listen manually — the isMute state will
    // flip back to true (not sharing) on its own.
    // This effect just resets our loading spinner if it was stuck.
    useEffect(() => {
        setLoading(false);
    }, [isNotSharing]);

    const toggleScreenShare = async () => {
        if (typeof window === "undefined" || !screenShare) return;
        if (loading) return; // prevent double-click race

        setLoading(true);
        try {
            if (isSharing) {
                await screenShare.disable();
            } else {
                await screenShare.enable();
            }
        } catch (err: any) {
            // User dismissed the browser picker
            if (
                err?.name === "NotAllowedError" ||
                err?.message?.includes("NotAllowedError") ||
                err?.name === "AbortError"
            ) {
                toast.info("Screen sharing was cancelled.");
            } else {
                toast.error("Failed to toggle screen share.");
                console.error("Screen share error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggleScreenShare}
            disabled={loading}
            title={isSharing ? "Stop Presenting" : "Share Screen"}
            className={`px-5 h-12 rounded-full border flex items-center justify-center gap-2.5 transition-colors font-mono text-[11px] uppercase tracking-widest font-bold shadow-sm ${isSharing
                ? "bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20"
                : "bg-[#ffffff] border-[#ffffff] text-[#141313] hover:bg-[#c6c6c7]"
                } disabled:opacity-50`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSharing ? (
                <>
                    <MonitorOff className="w-4 h-4" />
                    Stop Presenting
                </>
            ) : (
                <>
                    <Monitor className="w-4 h-4" />
                    Share Screen
                </>
            )}
        </button>
    );
}
