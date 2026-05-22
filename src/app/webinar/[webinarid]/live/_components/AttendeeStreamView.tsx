"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  ParticipantView,
  Call,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Loader2, Zap, ShieldCheck } from "lucide-react";
import AttendeeChatPanel from "./AttendeeChatPanel";
import CTABanner from "./CTABanner";
import { updateAttendanceStatus } from "@/actions/attendence";
import { getWebinarStatus } from "@/actions/webinar";
import { AttendedTypeEnum, WebinarStatusEnum } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";

type Props = {
  webinarId: string;
  attendeeId: string;
  attendeeName: string;
  aiAgentId: string | null;
  initialStatus: AttendedTypeEnum | null;
};

export default function AttendeeStreamView({
  webinarId,
  attendeeId,
  attendeeName,
  aiAgentId,
  initialStatus,
}: Props) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCTA, setActiveCTA] = useState<"BUY_NOW" | "BOOK_A_CALL" | null>(
    null
  );
  const router = useRouter();

  const checkStatus = useCallback(async () => {
    const status = await getWebinarStatus(webinarId);
    if (status === WebinarStatusEnum.ENDED) {
      router.replace(`/webinar/${webinarId}`);
    }
  }, [webinarId, router]);

  // Poll for webinar status
  useEffect(() => {
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [checkStatus]);

  useEffect(() => {
    let streamClient: StreamVideoClient | null = null;

    const init = async (retries = 5, delay = 3000) => {
      try {
        const res = await fetch("/api/attendee-stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendeeId }),
        });
        const data = await res.json();
        if (!res.ok || !data.token) {
          throw new Error(data.error || "Failed to get stream token");
        }

        streamClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: { id: attendeeId, name: attendeeName },
          token: data.token,
        });

        const streamCall = streamClient.call("livestream", webinarId);

        // Try to join
        try {
          await streamCall.join({ create: false });
        } catch (joinErr: any) {
          // If call not found and we have retries left, wait and try again
          const msg = joinErr?.message ?? String(joinErr);
          if ((msg.includes("Call not found") || msg.includes("404")) && retries > 0) {
            console.log(`Call not found, retrying in ${delay}ms... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return init(retries - 1, delay);
          }
          throw joinErr;
        }

        setClient(streamClient);
        setCall(streamCall);

        await updateAttendanceStatus(
          webinarId,
          attendeeId,
          AttendedTypeEnum.ATTENDED
        );
      } catch (err: any) {
        console.error("AttendeeStreamView init error:", err);
        const msg = err?.message ?? String(err);
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
      streamClient?.disconnectUser();
    };
  }, [webinarId, attendeeId, attendeeName]);

  // Listen for host CTA events
  useEffect(() => {
    if (!call) return;
    const unsubscribe = call.on("custom", (event: any) => {
      if (event.custom?.type === "CTA_TRIGGERED") {
        setActiveCTA(event.custom.ctaType as "BUY_NOW" | "BOOK_A_CALL");
      }
    });
    return () => unsubscribe();
  }, [call]);

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-6 bg-black text-white px-8 text-center selection:bg-purple-500/30">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/10">
          <Zap className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">Connection Error</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-xl shadow-purple-600/20 active:scale-95"
        >
          Try to Reconnect
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-6 bg-black text-white selection:bg-purple-500/30">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-purple-500/20 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
          <div className="absolute -inset-4 bg-purple-500/10 blur-2xl rounded-full animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Joining Live Stream
          </p>
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">
            Securing your connection...
          </p>
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
          setActiveCTA={setActiveCTA}
          initialStatus={initialStatus}
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
  setActiveCTA,
  initialStatus,
}: {
  webinarId: string;
  attendeeId: string;
  attendeeName: string;
  aiAgentId: string | null;
  activeCTA: "BUY_NOW" | "BOOK_A_CALL" | null;
  setActiveCTA: (v: "BUY_NOW" | "BOOK_A_CALL" | null) => void;
  initialStatus: AttendedTypeEnum | null;
}) {
  const { useParticipants, useIsCallLive } = useCallStateHooks();
  const participants = useParticipants();
  const isLive = useIsCallLive();

  // Find the host - in a livestream, the host is usually the only one with a video stream
  // or we can assume the first participant who is not the current user is the host
  const hostParticipant = participants.find((p) => p.userId !== attendeeId && p.videoStream);

  // If no one is streaming video, just take the first participant that isn't the current user
  const displayParticipant = hostParticipant || participants.find((p) => p.userId !== attendeeId);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black overflow-hidden selection:bg-purple-500/30">
      {/* ── Main Cinema Area ── */}
      <div className="flex-1 relative flex flex-col min-h-0 p-4 lg:p-6 overflow-y-auto custom-scrollbar">

        {/* Cinematic Video Container */}
        <div className="flex-shrink-0 min-h-[400px] lg:min-h-[500px] bg-zinc-950 rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl group transition-all duration-700">

          {/* Top Overlays */}
          <div className="absolute top-8 left-8 z-20 flex items-center gap-4 pointer-events-none">
            {isLive && (
              <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-red-600/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </div>
            )}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Verified Stream
            </div>
          </div>

          <div className="absolute top-8 right-8 z-20 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-300">
              {/* Correct viewer count: total participants minus the host */}
              {Math.max(0, participants.length - 1)} watching
            </div>
          </div>

          {/* Player Content */}
          {displayParticipant ? (
            <div className="w-full h-full transform transition-transform duration-700">
              <ParticipantView
                participant={displayParticipant}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 text-center max-w-sm px-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-purple-500/5 border border-purple-500/10 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-500/40" />
                </div>
                <div className="absolute -inset-2 bg-purple-500/5 blur-xl rounded-full" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-zinc-100">Waiting for Host</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  The broadcast is ready and will start automatically as soon as the host goes live.
                </p>
              </div>
            </div>
          )}

          {/* CTA Overlay */}
          {activeCTA && (
            <div className="absolute inset-x-0 bottom-12 z-50 flex justify-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-full max-w-xl">
                <CTABanner
                  type={activeCTA}
                  webinarId={webinarId}
                  attendeeId={attendeeId}
                  aiAgentId={aiAgentId}
                  onClose={() => setActiveCTA(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar: Interactive Chat ── */}
      <div className="w-full lg:w-[400px] border-l border-white/5 flex flex-col bg-zinc-950/50 shrink-0 h-[45vh] lg:h-full backdrop-blur-3xl">
        <div className="p-4 lg:p-6 border-b border-white/5 flex flex-col gap-4 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Interactive Chat</h2>
            </div>
          </div>

          {/* Persistent CTA Button */}
          {initialStatus && initialStatus !== AttendedTypeEnum.CONVERTED && (
            <button
              onClick={() => setActiveCTA("BUY_NOW")}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
            >
              BUY NOW
            </button>
          )}

          {initialStatus === AttendedTypeEnum.CONVERTED && (
            <div className="w-full py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              ACCESS UNLOCKED
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <AttendeeChatPanel
            webinarId={webinarId}
            attendeeId={attendeeId}
            attendeeName={attendeeName}
          />
        </div>
      </div>
    </div>
  );
}
