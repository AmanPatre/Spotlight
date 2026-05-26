"use client";

import { useState, useEffect } from "react";
import {
  useCall,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { ArrowLeft, Power, Eye, VideoOff, Loader2, MessageSquare, Users, Settings, Mic, MicOff, Video, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateWebinarStatus } from "@/actions/webinar";
import { WebinarStatusEnum } from "@/generated/prisma/enums";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import HostChatPanel from "./HostChatPanel";
import { CtaTypeEnum } from "@/generated/prisma/enums";
import CTAControlPanel from "./CTAControlPanel";
import DeviceControlPanel from "./DeviceControlPanel";
import ParticipantSidebar from "./ParticipantSidebar";

type Props = {
  webinarId: string;
  webinarTitle?: string;
  aiAgentId: string | null;
  ctaType: CtaTypeEnum;
  hostId: string;
  hostName: string;
};

export default function HostStreamView({
  webinarId,
  webinarTitle,
  aiAgentId,
  ctaType,
  hostId,
  hostName,
}: Props) {
  const call = useCall();
  const { useIsCallLive, useParticipants, useLocalParticipant, useMicrophoneState, useCameraState } =
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

  const { isMute: isMicMuted } = useMicrophoneState();
  const { isMute: isCamOff } = useCameraState();

  const toggleMic = async () => {
    if (isMicMuted) await call?.microphone.enable();
    else await call?.microphone.disable();
  };

  const toggleCam = async () => {
    if (isCamOff) await call?.camera.enable();
    else await call?.camera.disable();
  };

  return (
    <div className="flex flex-col h-full bg-[#141313] text-[#e5e2e1]">
      {/* Top Header / Transactional App Bar */}
      <header className="h-[64px] border-b border-[#444748] flex items-center justify-between px-8 bg-[#141313] shrink-0 z-10">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-[#c4c7c8] hover:text-white transition-colors flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              <h1 className="text-[20px] font-medium text-white">{webinarTitle || "Live Session"}</h1>
            </div>
            <span className="font-mono text-[13px] text-[#c4c7c8] ml-5">Session ID: {webinarId}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[13px] text-[#c4c7c8] bg-[#2a2a2a] px-3 py-1 rounded border border-[#444748]">
            {isLive ? "Live" : "Setup Mode"}
          </span>
          <button
            onClick={handleEndStream}
            disabled={ending}
            className="bg-white text-black font-medium text-[12px] px-5 py-2.5 rounded hover:bg-[#e5e2e1] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Power className="w-4 h-4" />
            {ending ? "Ending..." : "End Stream"}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Center Stage: Video Player Area */}
        <section className="flex-1 bg-[#0e0e0e] flex flex-col relative">
          {/* Video Canvas */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full h-full max-w-6xl relative border border-[#444748] bg-black rounded overflow-hidden group">
              {localParticipant ? (
                <ParticipantView
                  participant={localParticipant}
                  className="w-full h-full object-cover"
                  mirror
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#c4c7c8] gap-4 bg-[#141313]">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                  <p className="text-sm">Starting broadcast setup...</p>
                </div>
              )}

              {/* Presenter Name Plate */}
              <div className="absolute bottom-6 left-6 bg-[#141313]/90 backdrop-blur border border-[#444748] px-4 py-2 rounded flex flex-col">
                <span className="font-mono text-[12px] text-white font-medium">{hostName}</span>
                <span className="font-mono text-[10px] text-[#c4c7c8] uppercase tracking-wider">Host</span>
              </div>

              {/* Live Viewers */}
              <div className="absolute top-6 right-6 bg-[#141313]/90 backdrop-blur border border-[#444748] px-3 py-1.5 rounded flex items-center gap-2">
                <Eye className="w-4 h-4 text-white" />
                <span className="font-mono text-[13px] text-white">{Math.max(0, participants.length - 1)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="h-[88px] border-t border-[#444748] bg-[#141313] flex items-center justify-center gap-4 shrink-0 px-8">
            <button
              onClick={toggleMic}
              className={`h-12 w-12 rounded-full border border-[#444748] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors group ${isMicMuted ? 'bg-red-500/10 text-red-400' : 'bg-[#141313] text-white'}`}
            >
              {isMicMuted ? <MicOff className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            </button>
            <button
              onClick={toggleCam}
              className={`h-12 w-12 rounded-full border border-[#444748] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors group ${isCamOff ? 'bg-red-500/10 text-red-400' : 'bg-[#141313] text-white'}`}
            >
              {isCamOff ? <VideoOff className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            </button>

            <div className="w-px h-8 bg-[#444748] mx-2"></div>

            <Popover>
              <PopoverTrigger className="h-12 w-12 rounded-full border border-[#444748] bg-[#141313] flex items-center justify-center hover:bg-[#2a2a2a] text-[#c4c7c8] hover:text-white transition-colors group">
                <Settings className="w-5 h-5" />
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#1c1b1b] border-[#444748] p-1.5 rounded-2xl shadow-2xl text-white mb-4" align="center" side="top">
                <DeviceControlPanel />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger className="h-12 w-12 rounded-full border border-[#444748] bg-[#141313] flex items-center justify-center hover:bg-[#2a2a2a] text-[#c4c7c8] hover:text-white transition-colors group">
                <Flame className="w-5 h-5" />
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#1c1b1b] border-[#444748] p-1.5 rounded-2xl shadow-2xl text-white mb-4" align="center" side="top">
                <CTAControlPanel call={call} aiAgentId={aiAgentId} ctaType={ctaType} />
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* Right Panel: Communications */}
        <aside className="w-[360px] border-l border-[#444748] bg-[#141313] flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-[#444748] shrink-0 px-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-4 flex justify-center border-b-2 transition-colors ${activeTab === "chat" ? "border-white text-white" : "border-transparent text-[#c4c7c8] hover:border-[#444748]"}`}
            >
              <span className="font-mono text-[12px] uppercase font-bold tracking-wider">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-4 flex justify-center border-b-2 transition-colors ${activeTab === "participants" ? "border-white text-white" : "border-transparent text-[#c4c7c8] hover:border-[#444748]"}`}
            >
              <span className="font-mono text-[12px] uppercase font-bold tracking-wider">Participants</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
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
        </aside>
      </main>
    </div>
  );
}
