"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { Loader2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

type Props = {
  webinarId: string;
  assistantId: string;
  attendeeName: string;
  attendeeId: string;
};

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

// ─── Vapi error helpers (unchanged) ──────────────────────────────────────────

function formatVapiErrorPayload(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (!e || typeof e !== "object") return String(e);
  const o = e as Record<string, unknown>;
  const inner = o.error;
  if (typeof inner === "string" && inner.trim()) return inner.trim();
  if (inner && typeof inner === "object") {
    const m = (inner as Record<string, unknown>).message;
    if (typeof m === "string" && m.length) return m;
  }
  if (typeof o.type === "string") return o.type;
  try { return JSON.stringify(o); } catch { return "Unknown error"; }
}

function formatCallStartFailed(ev: unknown): string {
  if (!ev || typeof ev !== "object") return String(ev);
  const o = ev as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof o.stage === "string" && o.stage) parts.push(`stage: ${o.stage}`);
  if (typeof o.error === "string" && o.error.trim()) parts.push(o.error.trim());
  if (typeof o.errorStack === "string" && o.errorStack.trim()) {
    const st = o.errorStack.trim();
    if (st !== "No stack trace available") parts.push(st);
  }
  if (o.context && typeof o.context === "object") {
    try { parts.push(`context: ${JSON.stringify(o.context)}`); } catch { /* ignore */ }
  }
  if (parts.length) return parts.join(" — ");
  try { return JSON.stringify(o); } catch { return "Call failed (no details). Check assistant ID and Vapi public key."; }
}

// ─── Transcript message type ──────────────────────────────────────────────────

type TranscriptEntry = {
  id: number;
  role: "user" | "ai" | "system";
  text: string;
  time: string;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VapiCallRoom({
  webinarId,
  assistantId,
  attendeeName,
  attendeeId,
}: Props) {
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const skipCallEndNavigation = useRef(false);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<CallStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const aiSpeakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [micReady, setMicReady] = useState(false);
  const [micPriming, setMicPriming] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { id: 0, role: "system", text: "Recording initiated. AI Agent connected.", time: nowTime() },
  ]);
  const transcriptIdRef = useRef(1);

  // Three refs that together handle streaming transcript grouping:
  // currentBubbleIdRef: which bubble we're currently writing into per role
  // bubbleBaseTextRef:  all committed (final) text in that bubble
  // lastActivityRef:    timestamp of last event for silence detection
  const currentBubbleIdRef = useRef<Record<string, number | null>>({});
  const bubbleBaseTextRef = useRef<Record<string, string>>({});
  const lastActivityRef = useRef<Record<string, number>>({});

  const MERGE_WINDOW_MS = 6000; // 6 s silence → new bubble

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  // Auto-scroll transcript
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  /**
   * Partial transcript — streams text into the current bubble.
   * Display = all committed sentences + current in-progress words.
   */
  const onPartialTranscript = useCallback((role: TranscriptEntry["role"], partialText: string) => {
    const now = Date.now();
    const bubbleId = currentBubbleIdRef.current[role];
    const lastActivity = lastActivityRef.current[role] ?? 0;

    if (bubbleId != null && now - lastActivity < MERGE_WINDOW_MS) {
      // Update same bubble in-place
      const base = bubbleBaseTextRef.current[role] ?? "";
      const display = base ? `${base} ${partialText}` : partialText;
      setTranscript((prev) =>
        prev.map((e) => (e.id === bubbleId ? { ...e, text: display } : e))
      );
    } else {
      // Silence was too long or no bubble yet — start fresh bubble
      const id = transcriptIdRef.current++;
      setTranscript((prev) => [...prev, { id, role, text: partialText, time: nowTime() }]);
      currentBubbleIdRef.current[role] = id;
      bubbleBaseTextRef.current[role] = ""; // Reset base for the new bubble
    }
    lastActivityRef.current[role] = now;
  }, []);

  /**
   * Final transcript — commits this sentence into the current bubble.
   * Appends to base text so future partials don't overwrite committed words.
   */
  const onFinalTranscript = useCallback((role: TranscriptEntry["role"], finalText: string) => {
    const now = Date.now();
    const bubbleId = currentBubbleIdRef.current[role];
    const lastActivity = lastActivityRef.current[role] ?? 0;

    if (bubbleId != null && now - lastActivity < MERGE_WINDOW_MS) {
      // Commit into existing bubble
      const base = bubbleBaseTextRef.current[role] ?? "";
      const newBase = base ? `${base} ${finalText}` : finalText;
      setTranscript((prev) =>
        prev.map((e) => (e.id === bubbleId ? { ...e, text: newBase } : e))
      );
      bubbleBaseTextRef.current[role] = newBase;
    } else {
      // Silence was too long or no bubble yet — start fresh
      const id = transcriptIdRef.current++;
      setTranscript((prev) => [...prev, { id, role, text: finalText, time: nowTime() }]);
      currentBubbleIdRef.current[role] = id;
      bubbleBaseTextRef.current[role] = finalText;
    }
    lastActivityRef.current[role] = now;
  }, []);

  // System messages always get their own bubble
  const addSystemEntry = useCallback((text: string) => {
    setTranscript((prev) => [
      ...prev,
      { id: transcriptIdRef.current++, role: "system", text, time: nowTime() },
    ]);
  }, []);

  const releaseMicrophone = useCallback(() => {
    try { vapiRef.current?.stop(); } catch { /* ignore */ }
    vapiRef.current = null;
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setMicReady(false);
  }, []);

  const endAndLeave = useCallback(async () => {
    skipCallEndNavigation.current = false;
    try { await vapiRef.current?.stop(); } catch { /* ignore */ }
    vapiRef.current = null;
    releaseMicrophone();
    setStatus("ended");
    router.push(`/webinar/${webinarId}/live`);
  }, [releaseMicrophone, router, webinarId]);

  const handleConnect = useCallback(async () => {
    if (!publicKey) { toast.error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY"); return; }
    setMicPriming(true);
    setMicDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;
    } catch (e) {
      console.warn("Could not prime microphone:", e);
      setMicDenied(true);
      setMicPriming(false);
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    const bumpAi = () => {
      setAiSpeaking(true);
      if (aiSpeakingTimer.current) clearTimeout(aiSpeakingTimer.current);
      aiSpeakingTimer.current = setTimeout(() => setAiSpeaking(false), 900);
    };

    vapi.on("call-start", () => {
      setStatus("active");
      vapi.setMuted(false);
      if (selectedDeviceId) {
        vapi.setInputDevicesAsync({ audioDeviceId: selectedDeviceId }).catch(console.warn);
      }
      setMuted(false);
      setMicReady(true);
      setMicPriming(false);
      addSystemEntry("Call connected. Voice session active.");

      fetch("/api/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, webinarId, status: "BREAKOUT_ROOM" }),
      }).catch(console.error);
    });

    vapi.on("call-end", () => {
      setStatus("ended");
      addSystemEntry("Session ended.");

      fetch("/api/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, webinarId, status: "FOLLOW_UP" }),
      }).catch(console.error);

      if (skipCallEndNavigation.current) {
        skipCallEndNavigation.current = false;
        return;
      }
      router.push(`/webinar/${webinarId}/live`);
    });

    vapi.on("speech-start", () => setAiSpeaking(true));
    vapi.on("speech-end", () => setAiSpeaking(false));

    vapi.on("message", (msg: { role?: string; type?: string; transcript?: string; transcriptType?: string }) => {
      if (!msg?.transcript) return;

      if (msg.role === "assistant") {
        bumpAi();
        if (msg.transcriptType === "partial") {
          onPartialTranscript("ai", msg.transcript);
        } else if (msg.transcriptType === "final") {
          onFinalTranscript("ai", msg.transcript);
        }
      }

      if (msg.role === "user") {
        if (msg.transcriptType === "partial") {
          onPartialTranscript("user", msg.transcript);
        } else if (msg.transcriptType === "final") {
          onFinalTranscript("user", msg.transcript);
        }
      }
    });

    vapi.on("error", (e: unknown) => {
      const detail = formatVapiErrorPayload(e);
      const type = e && typeof e === "object" && "type" in e ? String((e as { type?: string }).type) : "";
      console.warn(`[Vapi] ${type || "error"} ${detail}`);

      if (type === "daily-error") {
        const lower = detail.toLowerCase();
        if (lower.includes("ejection") || lower.includes("ended")) {
          toast.error("Call disconnected. " + detail, { duration: 8000 });
          setErrorMsg(detail);
          setStatus("error");
          releaseMicrophone();
          setMicPriming(false);
          return;
        }
        toast.error(`Voice connection: ${detail}`, { duration: 5000 });
        return;
      }
      setErrorMsg(detail);
      setStatus("error");
      releaseMicrophone();
      setMicPriming(false);
    });

    vapi.on("call-start-failed", (ev: unknown) => {
      const msg = formatCallStartFailed(ev);
      console.error("[Vapi] call-start-failed", msg);
      toast.error(msg, { duration: 10000 });
      setErrorMsg(msg);
      setStatus("error");
      releaseMicrophone();
      setMicPriming(false);
      setMicDenied(true);
    });

    setStatus("connecting");
    vapi.start(assistantId, { metadata: { webinarId, attendeeId } }, undefined, undefined, undefined, {
      roomDeleteOnUserLeaveEnabled: false,
    }).catch((e: unknown) => {
      console.error("Vapi start failed", e);
      setErrorMsg(e instanceof Error ? e.message : "Could not start voice session");
      setStatus("error");
      releaseMicrophone();
      setMicPriming(false);
    });
  }, [assistantId, publicKey, releaseMicrophone, router, webinarId, selectedDeviceId, attendeeId, onPartialTranscript, onFinalTranscript, addSystemEntry]);

  // Enumerate devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = allDevices.filter((d) => d.kind === "audioinput");
        setDevices(audioDevices);
        if (audioDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioDevices[0].deviceId);
        }
      } catch (e) { console.warn("Could not enumerate devices:", e); }
    };
    getDevices();
    navigator.mediaDevices.ondevicechange = getDevices;
  }, [selectedDeviceId]);

  // Elapsed timer
  useEffect(() => {
    if (status !== "active") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─── Missing public key ──────────────────────────────────────────────────────
  if (!publicKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-white px-6 text-center">
        <p className="text-sm text-red-400 font-mono max-w-md border border-red-900 bg-red-950/20 p-4">
          Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY
        </p>
        <button
          onClick={() => { releaseMicrophone(); router.push(`/webinar/${webinarId}/live`); }}
          className="border border-[#444748] text-[#e5e2e1] px-6 py-2 text-sm font-mono hover:bg-[#1c1b1b] transition-colors"
        >
          ← Back to live room
        </button>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────
  if (errorMsg && status === "error") {
    const isEjection = errorMsg.toLowerCase().includes("ejection");
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-white px-6 text-center">
        <div className="w-12 h-12 border border-[#ffb4ab] flex items-center justify-center">
          <span className="text-[#ffb4ab] font-mono text-xl">!</span>
        </div>
        <p className="text-sm text-[#ffb4ab] font-mono max-w-md">{errorMsg}</p>
        {isEjection && (
          <p className="text-xs text-[#8e9192] font-mono max-w-md leading-relaxed border-t border-[#444748] pt-4">
            This usually means the voice room closed on the server. Confirm the webinar&apos;s AI agent is a valid Vapi assistant, your public key matches that Vapi org, and check the call in the Vapi dashboard.
          </p>
        )}
        <button
          onClick={() => { releaseMicrophone(); router.push(`/webinar/${webinarId}/live`); }}
          className="border border-[#444748] text-[#e5e2e1] px-6 py-2 text-sm font-mono hover:bg-[#1c1b1b] transition-colors"
        >
          ← Back to live room
        </button>
      </div>
    );
  }

  // ─── Mic priming / pre-call screen ───────────────────────────────────────────
  if (!micReady) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-6"
        style={{
          backgroundImage: "radial-gradient(#2a2a2a 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div className="w-full max-w-md flex flex-col items-center gap-10">

          {/* Brand */}
          <div className="flex items-center gap-3 self-start">
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              Spotlight
            </span>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest">AI Breakout</span>
          </div>

          {/* AI Visual + heading */}
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Animated ring indicator */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-zinc-700 animate-ping opacity-20" />
              <div className="absolute inset-2 rounded-full border border-zinc-600 opacity-40" />
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                Your AI Sales Rep is Ready
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm" style={{ fontFamily: "Geist, sans-serif" }}>
                You&apos;re about to enter a private voice session with an AI agent trained to answer your questions and help you make the right decision.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {["Voice-Powered", "Real-Time Answers", "Private Session"].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-widest"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Microphone selector */}
          <div className="w-full space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block">
              Select Microphone
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-zinc-200 font-mono focus:outline-none focus:border-white transition-colors cursor-pointer"
            >
              {devices.length === 0 && (
                <option value="">No microphone detected…</option>
              )}
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* CTA */}
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={micPriming || devices.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm py-3 px-8 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              {micPriming ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to AI…</>
              ) : (
                <><Mic className="w-4 h-4" /> Join AI Breakout Session</>
              )}
            </button>

            {micDenied && (
              <p className="text-xs text-yellow-400 font-mono text-center">
                Microphone access denied. Click the 🔒 lock in your address bar → Microphone → Allow.
              </p>
            )}

            <button
              type="button"
              onClick={() => { releaseMicrophone(); router.push(`/webinar/${webinarId}/live`); }}
              className="text-zinc-600 text-xs font-mono hover:text-white transition-colors text-center"
            >
              ← Return to live stream
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─── Active Call UI ───────────────────────────────────────────────────────────
  return (
    <div className="bg-[#141313] text-[#e5e2e1] h-screen w-screen overflow-hidden flex flex-col md:flex-row">

      {/* ── Left: Main Visualization Canvas ─────────────────────────── */}
      <main className="flex-1 relative flex flex-col h-full border-r border-[#444748]">

        {/* Header */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-[#ffb4ab] animate-pulse" : "bg-[#8e9192]"}`} />
              <h1 className="font-mono text-[11px] text-[#e5e2e1] uppercase tracking-widest">
                Live Breakout Session
              </h1>
            </div>
            <div className="font-mono text-[13px] text-[#8e9192]">
              {attendeeName} · AI Breakout
            </div>
          </div>
          <div className="font-mono text-[13px] text-[#8e9192]">
            {fmt(elapsed)}
          </div>
        </header>

        {/* Center Stage: Concentric Rings Visualization */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Dot grid background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(#444748 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />

          {/* Crosshairs */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-[#444748] opacity-20" />
          <div className="absolute left-1/2 top-0 w-px h-full bg-[#444748] opacity-20" />

          {/* Concentric rings */}
          <div className="relative w-[280px] h-[280px] md:w-[480px] md:h-[480px] flex items-center justify-center">
            {/* Outer ring */}
            <div
              className={`absolute inset-0 border rounded-full transition-all duration-500 ${aiSpeaking ? "border-white opacity-30" : "border-[#444748] opacity-20"}`}
              style={{ animation: "ringPulse 4s cubic-bezier(0.4,0,0.6,1) infinite" }}
            />
            {/* Mid ring */}
            <div
              className={`absolute inset-[15%] border rounded-full transition-all duration-500 ${aiSpeaking ? "border-white opacity-50" : "border-[#444748] opacity-40"}`}
              style={{ animation: "ringPulse 3s cubic-bezier(0.4,0,0.6,1) infinite", animationDelay: "0.5s" }}
            />
            {/* Inner ring */}
            <div
              className={`absolute inset-[30%] border rounded-full transition-all duration-500 ${aiSpeaking ? "border-white opacity-70" : "border-[#444748] opacity-60"}`}
              style={{ animation: "ringPulse 2s cubic-bezier(0.4,0,0.6,1) infinite", animationDelay: "1s" }}
            />

            {/* Core instrument */}
            <div className="relative w-32 h-32 md:w-44 md:h-44 border border-[#444748] bg-[#1c1b1b] rounded-full flex flex-col items-center justify-center gap-2 z-10">
              {/* Waveform bars */}
              <div className="flex items-end gap-1 h-8">
                {[3, 6, 9, 5, 8, 4, 7, 3].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-white rounded-sm transition-all duration-150 ${aiSpeaking ? "opacity-90" : "opacity-20"}`}
                    style={{
                      height: aiSpeaking ? `${h * 3}px` : "4px",
                      transitionDelay: `${i * 30}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-[11px] text-white uppercase tracking-widest">AI Agent</span>
                <span className="font-mono text-[10px] text-[#8e9192]">
                  {aiSpeaking ? "Speaking" : status === "active" ? "Listening" : "Standby"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <footer className="p-8 flex justify-center items-center gap-6 z-10"
          style={{ background: "linear-gradient(to top, #141313 60%, transparent)" }}
        >
          {/* Mute */}
          <button
            aria-label="Toggle Microphone"
            onClick={() => {
              const v = vapiRef.current;
              if (!v) return;
              const next = !v.isMuted();
              v.setMuted(next);
              setMuted(next);
            }}
            disabled={status !== "active"}
            className="w-12 h-12 border border-[#444748] bg-transparent flex items-center justify-center text-[#e5e2e1] hover:bg-[#353434] transition-colors disabled:opacity-30"
          >
            {muted ? <MicOff className="w-5 h-5 text-[#ffb4ab]" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera (disabled) */}
          <button
            aria-label="Toggle Camera"
            disabled
            className="w-12 h-12 border border-[#444748] bg-[#1c1b1b] flex items-center justify-center text-[#444748] cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </button>

          {/* End Call (primary destructive) */}
          <button
            aria-label="End Breakout Session"
            onClick={() => void endAndLeave()}
            className="h-12 px-8 border border-[#ffb4ab] bg-transparent text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-[#141313] transition-all font-mono text-[11px] uppercase tracking-wider flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0l-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
            </svg>
            End Call
          </button>

          {/* Buy Now Button */}
          <button
            aria-label="Buy Now"
            onClick={() => {
              skipCallEndNavigation.current = true;
              void vapiRef.current?.stop();
              releaseMicrophone();
              router.push(`/webinar/${webinarId}/checkout`);
            }}
            className="h-12 px-8 bg-white text-black hover:bg-zinc-200 transition-all font-mono text-[11px] uppercase tracking-wider flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.451 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Buy Now
          </button>

          {/* Settings */}
          <button
            aria-label="Audio Settings"
            className="w-12 h-12 border border-[#444748] bg-transparent flex items-center justify-center text-[#e5e2e1] hover:bg-[#353434] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </footer>
      </main>

      {/* ── Right: Transcript Panel ──────────────────────────────────── */}
      <aside className="w-full md:w-[360px] lg:w-[400px] h-[40vh] md:h-screen bg-[#0e0e0e] flex flex-col border-t md:border-t-0 md:border-l border-[#444748]">

        {/* Panel header */}
        <div className="p-4 border-b border-[#444748] flex items-center justify-between bg-[#1c1b1b]">
          <h2 className="font-mono text-[11px] text-[#e5e2e1] uppercase tracking-widest">Live Transcript</h2>
          <svg className="w-4 h-4 text-[#8e9192]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#353434 transparent" }}
        >
          {transcript.map((entry) => {
            if (entry.role === "system") {
              return (
                <div key={entry.id} className="flex flex-col gap-1 w-full opacity-60">
                  <span className="font-mono text-[10px] text-[#8e9192] uppercase tracking-wider">
                    System · {entry.time}
                  </span>
                  <p className="font-mono text-[13px] text-[#8e9192] italic">{entry.text}</p>
                </div>
              );
            }
            if (entry.role === "user") {
              return (
                <div key={entry.id} className="flex flex-col gap-1 w-full pl-4 border-l border-[#444748]">
                  <span className="font-mono text-[10px] text-[#c4c7c8] uppercase tracking-wider">
                    {attendeeName} · {entry.time}
                  </span>
                  <p className="text-[14px] text-[#e5e2e1]" style={{ fontFamily: "Geist, Inter, sans-serif", lineHeight: 1.5 }}>
                    {entry.text}
                  </p>
                </div>
              );
            }
            // AI
            return (
              <div key={entry.id} className="flex flex-col gap-1 w-full pl-3 border-l-2 border-white bg-[#1c1b1b] p-3 -ml-3">
                <span className="font-mono text-[10px] text-white uppercase tracking-wider">
                  AI Agent · {entry.time}
                </span>
                <p className="text-[14px] text-[#e5e2e1]" style={{ fontFamily: "Geist, Inter, sans-serif", lineHeight: 1.5 }}>
                  {entry.text}
                </p>
              </div>
            );
          })}

          {/* AI typing indicator */}
          {aiSpeaking && (
            <div className="flex flex-col gap-1 w-full pl-3 border-l-2 border-white bg-[#1c1b1b] p-3 -ml-3 opacity-80 animate-pulse">
              <span className="font-mono text-[10px] text-white uppercase tracking-wider">AI Agent · Processing</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                <span className="w-1.5 h-1.5 bg-white rounded-full opacity-30" />
              </div>
            </div>
          )}

          <div ref={transcriptBottomRef} />
        </div>

        {/* Voice input footer */}
        <div className="p-4 border-t border-[#444748] bg-[#1c1b1b] opacity-50 cursor-not-allowed">
          <div className="w-full bg-[#141313] border border-[#444748] flex items-center px-3 py-2">
            <span className="font-mono text-[13px] text-[#444748] flex-1">Voice input active...</span>
            <Mic className="w-4 h-4 text-[#444748]" />
          </div>
        </div>
      </aside>

      {/* ── Connecting overlay ───────────────────────────────────────── */}
      {status === "connecting" && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="flex flex-col items-center gap-4 border border-[#444748] bg-[#141313] px-10 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <p className="font-mono text-sm text-[#c4c7c8] uppercase tracking-wider">Connecting to AI…</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(0.95); opacity: 0.5; }
          50%  { transform: scale(1.05); opacity: 1;   }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
