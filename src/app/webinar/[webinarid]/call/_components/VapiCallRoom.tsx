"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  webinarId: string;
  assistantId: string;
  attendeeName: string;
  attendeeId: string;
};

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

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
  try {
    return JSON.stringify(o);
  } catch {
    return "Unknown error";
  }
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
    try {
      parts.push(`context: ${JSON.stringify(o.context)}`);
    } catch {
      /* ignore */
    }
  }
  if (parts.length) return parts.join(" — ");
  try {
    return JSON.stringify(o);
  } catch {
    return "Call failed (no details). Check assistant ID and Vapi public key.";
  }
}

function replacerSafe(_key: string, value: unknown) {
  if (value instanceof Error) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
    };
  }
  return value;
}

export default function VapiCallRoom({
  webinarId,
  assistantId,
  attendeeName,
  attendeeId,
}: Props) {
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const skipCallEndNavigation = useRef(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const aiSpeakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Mic must be primed inside a click handler so the browser keeps user activation for Daily/Vapi. */
  const [micReady, setMicReady] = useState(false);
  const [micPriming, setMicPriming] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  /**
   * Keep the granted MediaStream alive and pass its audio track into Daily via Vapi.
   * Stopping tracks after "Allow" then letting Daily call getUserMedia again often yields silence / ejection.
   */
  const micStreamRef = useRef<MediaStream | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  const releaseMicrophone = useCallback(() => {
    try {
      vapiRef.current?.stop();
    } catch { /* ignore */ }
    vapiRef.current = null;
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    setMicReady(false);
  }, []);

  const endAndLeave = useCallback(async () => {
    skipCallEndNavigation.current = false;
    try {
      await vapiRef.current?.stop();
    } catch {
      /* ignore */
    }
    vapiRef.current = null;
    releaseMicrophone();
    setStatus("ended");
    router.push(`/webinar/${webinarId}/live`);
  }, [releaseMicrophone, router, webinarId]);

  const handleConnect = useCallback(async () => {
    if (!publicKey) {
      toast.error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
      return;
    }

    setMicPriming(true);
    setMicDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
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
      vapi.setMuted(false); // Explicitly ensure we are not muted
      setMuted(false);
      setMicReady(true);
      setMicPriming(false);

      // Track AI Call started -> ADDED_TO_CART matches AI Call column
      fetch("/api/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId,
          webinarId,
          status: "ADDED_TO_CART",
        }),
      }).catch(console.error);
    });

    vapi.on("call-end", () => {
      setStatus("ended");

      // Track AI Call ended -> FOLLOW_UP
      fetch("/api/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId,
          webinarId,
          status: "FOLLOW_UP",
        }),
      }).catch(console.error);

      if (skipCallEndNavigation.current) {
        skipCallEndNavigation.current = false;
        return;
      }
      router.push(`/webinar/${webinarId}/live`);
    });

    vapi.on("speech-start", () => setAiSpeaking(true));
    vapi.on("speech-end", () => setAiSpeaking(false));

    vapi.on("message", (msg: { role?: string; type?: string }) => {
      if (msg?.role === "assistant") bumpAi();
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
      setMicDenied(true); // likely permission denied
    });

    setStatus("connecting");

    vapi
      .start(assistantId, undefined, undefined, undefined, undefined, {
        roomDeleteOnUserLeaveEnabled: false,
      })
      .catch((e: unknown) => {
        console.error("Vapi start failed", e);
        setErrorMsg(e instanceof Error ? e.message : "Could not start voice session");
        setStatus("error");
        releaseMicrophone();
        setMicPriming(false);
      });
  }, [assistantId, publicKey, releaseMicrophone, router, webinarId]);

  useEffect(() => {
    if (status !== "active") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Listen to local mic to animate user speaking
  useEffect(() => {
    if (!micReady || !micStreamRef.current || muted) {
      setUserSpeaking(false);
      return;
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioCtx.createMediaStreamSource(micStreamRef.current);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;
    let lastState = false;

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;

      const isSpeaking = avg > 12; // Threshold for speaking
      if (isSpeaking !== lastState) {
        lastState = isSpeaking;
        setUserSpeaking(isSpeaking);
      }

      animationFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioCtx.close().catch(() => { });
    };
  }, [micReady, muted]);

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const initial = attendeeName.trim().charAt(0).toUpperCase() || "?";

  if (!publicKey) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-red-400 max-w-md">
          Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY
        </p>
        <Button
          variant="outline"
          onClick={() => {
            releaseMicrophone();
            router.push(`/webinar/${webinarId}/live`);
          }}
        >
          Back to live room
        </Button>
      </div>
    );
  }

  if (errorMsg && status === "error") {
    const isEjection = errorMsg.toLowerCase().includes("ejection");
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-red-400 max-w-md">{errorMsg}</p>
        {isEjection && (
          <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
            This usually means the voice room closed on the server. Confirm the
            webinar&apos;s AI agent is a valid Vapi assistant, your public key
            matches that Vapi org, and check the call in the Vapi dashboard. If
            the problem persists, try another browser or disable React Strict
            Mode for local dev (it can tear down the call once while connecting).
          </p>
        )}
        <Button
          variant="outline"
          onClick={() => {
            releaseMicrophone();
            router.push(`/webinar/${webinarId}/live`);
          }}
        >
          Back to live room
        </Button>
      </div>
    );
  }

  if (!micReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center text-white">
        <div className="flex size-16 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10">
          <Mic className="size-8 text-purple-400" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-semibold">Microphone required</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Browsers only allow the AI to hear you after you explicitly allow
            the microphone. Use{" "}
            <span className="text-zinc-200">HTTPS</span> or{" "}
            <span className="text-zinc-200">localhost</span>.
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed border-t border-white/10 pt-3 mt-1">
            If you are the <span className="text-zinc-300">host</span> in one
            tab (Stream live) and the <span className="text-zinc-300">
              attendee
            </span>{" "}
            here in another, both can try to use the mic at once. That can
            cause silence, flaky audio, or disconnects. For solo testing: open
            the attendee link in{" "}
            <span className="text-zinc-300">Incognito</span> or another
            browser, or mute / turn off the host microphone while you test this
            room.
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            After you connect, the mic preview stays active so Daily can publish
            the same track — that is intentional.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="rounded-xl px-8"
          onClick={() => void handleConnect()}
          disabled={micPriming}
        >
          {micPriming ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Checking microphone…
            </>
          ) : (
            <>
              <Mic className="mr-2 size-4" />
              Allow microphone &amp; connect
            </>
          )}
        </Button>
        {micDenied && (
          <p className="text-xs text-amber-400 max-w-sm">
            If Chrome blocked access: click the lock icon in the address bar →
            Site settings → Microphone → Allow, then try again.
          </p>
        )}
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-500"
          onClick={() => {
            releaseMicrophone();
            router.push(`/webinar/${webinarId}/live`);
          }}
        >
          Back to live room
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-8">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-3xl border bg-zinc-900/80 p-8 transition-shadow duration-300",
            aiSpeaking
              ? "border-purple-500/60 shadow-[0_0_40px_rgba(168,85,247,0.25)]"
              : "border-white/10",
          )}
        >
          <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Mic className="size-3.5 text-purple-400" />
            AI Assistant
          </div>
          <div
            className={cn(
              "flex size-28 items-center justify-center rounded-full border-4 bg-zinc-950 transition-all duration-300 md:size-32",
              aiSpeaking
                ? "border-purple-500 scale-105"
                : "border-purple-500/30",
            )}
          >
            <Bot className="size-14 text-purple-400 md:size-16" />
          </div>
        </div>

        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-3xl border bg-zinc-900/80 p-8 transition-shadow duration-300",
            userSpeaking
              ? "border-indigo-500/60 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
              : "border-white/10",
          )}
        >
          <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-medium text-zinc-400">
            <UserRound className="size-3.5 text-indigo-400" />
            {attendeeName}
          </div>
          <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-mono text-zinc-300">
            {fmt(elapsed)}
          </div>
          <div
            className={cn(
              "flex size-28 items-center justify-center rounded-full border-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-2xl font-bold transition-all duration-300 md:size-32 md:text-3xl",
              userSpeaking ? "border-indigo-300 scale-105" : "border-white/20",
            )}
          >
            {initial}
          </div>
          <div className="absolute bottom-6 right-6">
            {muted ? (
              <MicOff className="size-5 text-red-400" />
            ) : (
              <Mic className="size-5 text-indigo-400" />
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-white/10 bg-zinc-950/95 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-mono">{fmt(elapsed)}</span>
            <span className="hidden sm:inline">on call</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/webinar/${webinarId}/checkout?attendeeId=${attendeeId}`)}
              className="hidden sm:block py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              BUY NOW
            </button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full border-white/20"
              onClick={() => {
                const v = vapiRef.current;
                if (!v) return;
                const next = !v.isMuted();
                v.setMuted(next);
                setMuted(next);
              }}
              disabled={status !== "active"}
            >
              {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2 rounded-full px-6"
              onClick={() => void endAndLeave()}
            >
              <PhoneOff className="size-4" />
              End call
            </Button>
          </div>
        </div>
      </div>

      {status === "connecting" && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900 px-8 py-6">
            <Loader2 className="size-8 animate-spin text-purple-400" />
            <p className="text-sm text-zinc-300">Connecting to AI…</p>
          </div>
        </div>
      )}
    </div>
  );
}
