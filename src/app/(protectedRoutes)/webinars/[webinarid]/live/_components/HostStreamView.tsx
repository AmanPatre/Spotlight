"use client";

import { useState, useEffect } from "react";
import {
  useCall,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { Radio, MonitorStop, Eye, VideoOff, Loader2, MessageSquare, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateWebinarStatus } from "@/actions/webinar";
import { WebinarStatusEnum } from "@/generated/prisma/enums";
import { toast } from "sonner";
import HostChatPanel from "./HostChatPanel";
import CTAControlPanel from "./CTAControlPanel";
import DeviceControlPanel from "./DeviceControlPanel";
import ParticipantSidebar from "./ParticipantSidebar";

type Props = {
  webinarId: string;
  aiAgentId: string | null;
  hostId: string;
  hostName: string;
};

export default function HostStreamView({
  webinarId,
  aiAgentId,
  hostId,
  hostName,
}: Props) {
  const call = useCall();
  const { useIsCallLive, useParticipants, useLocalParticipant } =
    useCallStateHooks();
  const participants = useParticipants();

  const localParticipant = useLocalParticipant();
  const isLive = useIsCallLive();
  const router = useRouter();
  const [ending, setEnding] = useState(false);
  const [devicesReady, setDevicesReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  // Enable camera and mic automatically when the host enters the room
  useEffect(() => {
    if (!call) return;
    const setupDevices = async () => {
      try {
        await call.camera.enable();
        await call.microphone.enable();
        setDevicesReady(true);
      } catch (err) {
        console.error("Could not enable devices:", err);
        setDevicesReady(true);
      }
    };
    setupDevices();
    return () => {
      call.camera.disable();
      call.microphone.disable();
    };
  }, [call]);

  // Auto-go-live
  useEffect(() => {
    if (!call || !devicesReady || isLive) return;
    const autoGoLive = async () => {
      try {
        await call.goLive();
      } catch (err) {
        console.error("Auto-goLive failed:", err);
      }
    };
    autoGoLive();
  }, [call, devicesReady, isLive]);

  const handleEndStream = async () => {
    if (!call) return;
    setEnding(true);
    try {
      await call.stopLive();
      await updateWebinarStatus(webinarId, WebinarStatusEnum.ENDED);
      toast.success("Webinar ended.");
      router.push(`/webinars/${webinarId}`);
    } catch {
      toast.error("Failed to end stream. Please try again.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-4 bg-black text-white selection:bg-purple-500/30">
      {/* ── Left Column: Stream Info & Controls ── */}
      <div className="flex flex-col flex-1 min-w-0 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* ── Video Preview Container ── */}
        <div className="relative flex-shrink-0 min-h-[300px] lg:min-h-[400px] group rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 aspect-video shadow-2xl ring-1 ring-white/10 hover:ring-purple-500/30 transition-all duration-500">
          {localParticipant ? (
            <div className="w-full h-full relative">
              <ParticipantView
                participant={localParticipant}
                className="w-full h-full object-cover"
                mirror
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-zinc-900/50 backdrop-blur-sm">
              {devicesReady ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <VideoOff className="w-8 h-8 text-red-400 opacity-60" />
                  </div>
                  <p className="text-sm font-medium">Camera is disabled</p>
                </>
              ) : (
                <>
                  <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                  <p className="text-sm font-medium">Starting your broadcast setup...</p>
                </>
              )}
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-6 left-6 flex items-center gap-3 pointer-events-none">
            {isLive && (
              <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[11px] font-black text-white uppercase tracking-widest shadow-lg shadow-red-600/20">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Live
              </div>
            )}
            <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-[11px] font-medium text-zinc-300">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              {Math.max(0, participants.length - 1)} viewers
            </div>
          </div>
        </div>

        {/* ── Dashboard Bottom Bar ── */}
        <div className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Radio className={`w-5 h-5 ${isLive ? "text-purple-400 animate-pulse" : "text-zinc-500"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isLive ? "Live Stream Active" : "Stream Connecting..."}
              </p>
              <p className="text-xs text-zinc-500 font-medium">
                {isLive ? "Your audience can see and hear you now" : "Waiting for stable connection"}
              </p>
            </div>
          </div>

          <button
            onClick={handleEndStream}
            disabled={ending}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600/10 hover:bg-red-600 border border-red-600/20 hover:border-red-600 text-red-500 hover:text-white text-sm font-bold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-red-600/5"
          >
            <MonitorStop className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {ending ? "Ending..." : "End Broadcast"}
          </button>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DeviceControlPanel />
          <CTAControlPanel call={call} aiAgentId={aiAgentId} />
        </div>
      </div>

      {/* ── Right Column: Interactive Sidebar ── */}
      <div className="w-full lg:w-[400px] flex flex-col shrink-0 gap-4">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-zinc-900/60 border border-white/5 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === "chat" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Live Chat
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === "participants" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Participants
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 bg-zinc-950/40 rounded-3xl border border-white/5 overflow-hidden">
          {activeTab === "chat" ? (
            <HostChatPanel
              webinarId={webinarId}
              hostId={hostId}
              hostName={hostName}
            />
          ) : (
            <ParticipantSidebar webinarId={webinarId} />
          )}
        </div>
      </div>
    </div>
  );
}
