"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  ParticipantView,
  Call,
  useCall,
  useCallStateHooks,
  hasScreenShare,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Loader2, Settings, Maximize2, Volume2, Pause, Users, MessageSquare } from "lucide-react";
import AttendeeChatPanel from "./AttendeeChatPanel";
import CTABanner from "./CTABanner";
import { updateAttendanceStatus } from "@/actions/attendence";
import { getWebinarStatus } from "@/actions/webinar";
import { AttendedTypeEnum, WebinarStatusEnum } from "@prisma/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SyncVideoPlayer from "@/components/ui/ReusableComponent/SyncVideoPlayer";

type Props = {
  webinarId: string;
  attendeeId: string;
  attendeeName: string;
  aiAgentId: string | null;
  videoUrl: string | null;
  isPreRecorded: boolean;
};

export default function AttendeeStreamView({
  webinarId,
  attendeeId,
  attendeeName,
  aiAgentId,
  videoUrl,
  isPreRecorded,
}: Props) {
  // ... existing state and logic ...
  // (Retaining the logic from lines 34-268)
  // I will just replace the inner view implementation
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCTA, setActiveCTA] = useState<"BUY_NOW" | "BOOK_A_CALL" | null>(null);
  const [ctaMetadata, setCtaMetadata] = useState<{
    ctaLabel?: string | null;
    productTitle?: string | null;
    price?: number | null;
  } | null>(null);
  const [webinarEnded, setWebinarEnded] = useState(false);
  const [webinarStatus, setWebinarStatus] = useState<WebinarStatusEnum | null>(null);
  const router = useRouter();

  const checkStatus = useCallback(async () => {
    try {
      const status = await getWebinarStatus(webinarId);
      setWebinarStatus(status);
      if (status === WebinarStatusEnum.ENDED) {
        setWebinarEnded(true);
      }
    } catch (e) {
      console.error("Failed to check webinar status:", e);
    }
  }, [webinarId]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 7000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  useEffect(() => {
    if (webinarStatus !== WebinarStatusEnum.LIVE) return;

    let streamClient: StreamVideoClient | null = null;
    let isMounted = true;

    const init = async (retries = 5, delay = 3000) => {
      try {
        const res = await fetch("/api/attendee-stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendeeId }),
        });
        const data = await res.json();
        if (!res.ok || !data.token) throw new Error(data.error || "Failed to get stream token");

        streamClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: { id: attendeeId, name: attendeeName },
          token: data.token,
        });

        const streamCall = streamClient.call("livestream", webinarId);

        try {
          await streamCall.join({ create: false });
        } catch (joinErr: unknown) {
          const msg = joinErr instanceof Error ? joinErr.message : String(joinErr);
          if ((msg.includes("Call not found") || msg.includes("404")) && retries > 0) {
            await new Promise((r) => setTimeout(r, delay));
            return init(retries - 1, delay);
          }
          throw joinErr;
        }

        if (!isMounted) {
          streamClient.disconnectUser();
          return;
        }

        setClient(streamClient);
        setCall(streamCall);

        await updateAttendanceStatus(webinarId, attendeeId, AttendedTypeEnum.ATTENDED);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Call not found") || msg.includes("404")) {
          setError("The host hasn't started the stream yet. Hang tight!");
        } else if (msg.includes("403") || msg.includes("Forbidden")) {
          setError("You don't have permission to join this stream.");
        } else {
          setError("Failed to connect to the live broadcast. Please refresh.");
        }
      }
    };

    init();
    return () => {
      isMounted = false;
      streamClient?.disconnectUser();
    };
  }, [webinarId, attendeeId, attendeeName, webinarStatus]);

  useEffect(() => {
    if (!call) return;

    const checkEnded = () => {
      if (call.state.endedAt) {
        setWebinarEnded(true);
      }
    };

    // Initial check
    checkEnded();

    // Listen for events
    const unsubscribeEnded = call.on("call.ended", () => {
      setWebinarEnded(true);
    });

    const unsubscribeCustom = call.on("custom", (event: any) => {
      if (event.custom?.type === "CTA_TRIGGERED") {
        setActiveCTA(event.custom.ctaType as "BUY_NOW" | "BOOK_A_CALL");
        setCtaMetadata(event.custom.ctaMetadata || null);
      }
    });

    return () => {
      unsubscribeEnded();
      unsubscribeCustom();
    };
  }, [call]);

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-8 bg-black text-white px-8 text-center"
        style={{ backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      >
        <div className="w-14 h-14 border border-[#ffb4ab] flex items-center justify-center">
          <span className="text-[#ffb4ab] font-mono text-2xl">!</span>
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-lg font-semibold text-white">Connection Error</h2>
          <p className="text-sm text-zinc-400 font-mono">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-black font-mono text-[11px] uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
        >
          Try to Reconnect
        </button>
      </div>
    );
  }

  if (!client || !call) {
    const isWaiting = webinarStatus === WebinarStatusEnum.SCHEDULED;
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-6 bg-black text-white"
        style={{ backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white">
            {isWaiting ? "Waiting for Host" : "Joining Live Stream"}
          </p>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
            {isWaiting ? "The broadcast will begin shortly..." : "Securing your connection..."}
          </p>
        </div>
      </div>
    );
  }

  if (webinarEnded) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[800px] h-[800px] border border-zinc-800 rounded-full flex items-center justify-center">
            <div className="w-[600px] h-[600px] border border-zinc-700 rounded-full flex items-center justify-center">
              <div className="w-[400px] h-[400px] border border-zinc-600 rounded-full" />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6 gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border border-zinc-700 flex items-center justify-center">
              <span className="text-zinc-500 text-2xl font-mono">■</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              The Broadcast has ended.
            </h1>
            <p className="text-zinc-400">
              Main stage transmission closed. Session data is compiling.
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          {aiAgentId ? (
            <div className="flex flex-col items-center gap-6 bg-zinc-950 border border-zinc-800 p-8 w-full">
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest">Next Step</span>
                <h3 className="text-xl font-semibold text-white">
                  Join the AI Breakout Room
                </h3>
                <p className="text-sm text-zinc-500 text-center max-w-md">
                  Continue the discussion with an AI agent for a personalized consultation session.
                </p>
              </div>
              <button
                onClick={() => router.push(`/webinar/${webinarId}/call`)}
                className="bg-white text-black font-mono text-[11px] uppercase tracking-widest px-8 py-4 hover:bg-zinc-200 transition-colors flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Connect Mic & Join Breakout
              </button>
              <button
                onClick={() => router.push(`/webinar/${webinarId}`)}
                className="font-mono text-[11px] text-zinc-500 hover:text-white transition-colors underline-offset-4 hover:underline uppercase tracking-widest"
              >
                Return to Library
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push(`/webinar/${webinarId}`)}
              className="border border-zinc-800 text-white font-mono text-[11px] uppercase tracking-widest px-8 py-3 hover:bg-zinc-900 transition-colors"
            >
              Return to Library
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <AttendeeInnerView
          webinarId={webinarId}
          attendeeId={attendeeId}
          attendeeName={attendeeName}
          aiAgentId={aiAgentId}
          activeCTA={activeCTA}
          ctaMetadata={ctaMetadata}
          setActiveCTA={setActiveCTA}
          videoUrl={videoUrl}
          isPreRecorded={isPreRecorded}
        />
      </StreamCall>
    </StreamVideo>
  );
}

function AttendeeInnerView({
  webinarId,
  attendeeId,
  attendeeName,
  aiAgentId,
  activeCTA,
  ctaMetadata,
  setActiveCTA,
  videoUrl,
  isPreRecorded,
}: {
  webinarId: string;
  attendeeId: string;
  attendeeName: string;
  aiAgentId: string | null;
  activeCTA: "BUY_NOW" | "BOOK_A_CALL" | null;
  ctaMetadata: any;
  setActiveCTA: (v: "BUY_NOW" | "BOOK_A_CALL" | null) => void;
  videoUrl: string | null;
  isPreRecorded: boolean;
}) {
  const call = useCall();
  const { useParticipants, useIsCallLive } = useCallStateHooks();
  const participants = useParticipants();
  const screenSharingParticipants = participants.filter((p) => hasScreenShare(p));
  const isLive = useIsCallLive();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const hostParticipant = participants.find((p) => p.userId !== attendeeId && p.videoStream);
  const displayParticipant = hostParticipant || participants.find((p) => p.userId !== attendeeId);
  const activeScreenShare = screenSharingParticipants.length > 0 ? screenSharingParticipants[0] : null;

  const viewerCount = Math.max(0, participants.length - 1);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-black text-white overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Video Canvas ────────────────────────────────────────── */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden border-r border-zinc-800 p-6 transition-all duration-300">
          {/* Chat Toggle (when closed) */}
          <AnimatePresence>
            {!isChatOpen && (
              <motion.button
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                onClick={() => setIsChatOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-zinc-900/80 backdrop-blur-sm border-l border-t border-b border-zinc-700 p-3 hover:bg-zinc-800 transition-all rounded-l-xl shadow-2xl group flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 group-hover:text-zinc-200 transition-colors hidden md:block">Show Chat</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div
            ref={containerRef}
            className="w-full aspect-video bg-zinc-950 border border-zinc-800 relative group overflow-hidden"
          >

            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent)",
                  animation: "scanline 8s linear infinite",
                }}
              />
            </div>

            {/* LIVE badge */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
              {isLive && (
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono text-[11px] text-white uppercase">LIVE</span>
                  <span className="font-mono text-[11px] text-zinc-400 ml-1">REC_001</span>
                </div>
              )}
            </div>

            {/* Viewer count */}
            <div className="absolute top-6 right-6 z-20">
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-3 py-1.5">
                <Users className="w-3 h-3 text-zinc-400" />
                <span className="font-mono text-[11px] text-zinc-400">{viewerCount} watching</span>
              </div>
            </div>

            {/* Player content */}
            {isPreRecorded && videoUrl && call ? (
              <div className="w-full h-full z-10 relative bg-black">
                <SyncVideoPlayer videoUrl={videoUrl} isHost={false} call={call} />
              </div>
            ) : activeScreenShare ? (
              <div className="w-full h-full z-10 relative bg-black">
                {/* Master - Screen Share: force contain so it's NOT zoomed in */}
                <div className="w-full h-full screen-share-contain">
                  <ParticipantView
                    participant={activeScreenShare}
                    trackType="screenShareTrack"
                    className="w-full h-full"
                  />
                </div>

                {/* Detail - Floating Host Camera (Google Meet Style PiP) */}
                <div className="absolute bottom-6 right-6 w-48 sm:w-56 aspect-video bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl z-30 transition-all duration-300">
                  {displayParticipant ? (
                    <ParticipantView
                      participant={displayParticipant}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                    </div>
                  )}
                </div>
              </div>
            ) : displayParticipant ? (
              <div className="w-full h-full z-10 relative">
                <ParticipantView
                  participant={displayParticipant}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-center px-6 z-10 relative">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-400">
                    Waiting for Host
                  </p>
                  <p className="text-xs text-zinc-600 font-mono">
                    The broadcast will start automatically when the host goes live.
                  </p>
                </div>
              </div>
            )}

            {/* Hover controls overlay */}
            <div className="absolute bottom-0 left-0 w-full h-24 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              style={{ background: "linear-gradient(to top, black, transparent)" }}
            >
              <div className="absolute bottom-0 left-0 w-full flex items-center justify-between px-6 pb-4">
                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-zinc-400 transition-colors">
                    <Pause className="w-5 h-5" />
                  </button>
                  <button className="text-white hover:text-zinc-400 transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <span className="font-mono text-[11px] text-zinc-400">LIVE</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`p-2 rounded transition-colors ${isChatOpen ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button className="text-white hover:text-zinc-400 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-zinc-400 transition-colors"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* CTA Overlay (Moved outside aspect-video to prevent clipping) */}
          {activeCTA && (
            <div className="absolute bottom-6 left-6 right-6 z-50">
              <CTABanner
                type={activeCTA}
                webinarId={webinarId}
                attendeeId={attendeeId}
                aiAgentId={aiAgentId}
                metadata={ctaMetadata}
                onClose={() => setActiveCTA(null)}
              />
            </div>
          )}
        </div>

        {/* ── Chat Sidebar ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isChatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-zinc-950 flex flex-col h-full border-l border-zinc-800 shrink-0 overflow-hidden"
            >
              <div className="min-w-[320px] h-full flex flex-col">
                {/* Header */}
                <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-900">
                  <span className="font-mono text-[11px] text-white uppercase tracking-widest">Live Chat</span>
                  <span className="font-mono text-[11px] text-zinc-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {viewerCount.toLocaleString()}
                  </span>
                </div>

                {/* Chat */}
                <div className="flex-1 min-h-0 overflow-hidden [&_.str-chat]:h-full [&_.str-chat__container]:h-full [&_.str-chat]:!bg-zinc-950 [&_.str-chat__main-panel]:!bg-zinc-950 [&_.str-chat__list]:!bg-zinc-950">
                  <AttendeeChatPanel
                    webinarId={webinarId}
                    attendeeId={attendeeId}
                    attendeeName={attendeeName}
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(800px); }
        }
        /* Force screen share to show full content without zooming */
        .screen-share-contain .str-video__video,
        .screen-share-contain video {
          object-fit: contain !important;
        }
        .screen-share-contain .str-video__participant-view {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
