"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WebinarStatusEnum } from "@prisma/client";
import RegistrationForm from "./RegistrationForm";
import WaitingRoom from "./WaitingRoom";
import { CheckCircle2 } from "lucide-react";

type Props = {
  webinarId: string;
  title: string;
  description?: string | null;
  startTime: Date;
  presenterName: string;
  webinarStatus: WebinarStatusEnum;
};

export default function LandingPageClient({
  webinarId,
  title,
  description,
  startTime,
  presenterName,
  webinarStatus,
}: Props) {
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const router = useRouter();

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const storedId = localStorage.getItem(`spotlight_attendee_${webinarId}`);
    if (storedId) {
      setTimeout(() => {
        if (storedId !== attendeeId) setAttendeeId(storedId);
      }, 0);
    }
    if (storedId && webinarStatus === WebinarStatusEnum.LIVE) {
      router.push(`/webinar/${webinarId}/live`);
    }
  }, [webinarId, webinarStatus, router, attendeeId]);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(startTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const handleRegistrationSuccess = (id: string) => {
    setAttendeeId(id);
    if (webinarStatus === WebinarStatusEnum.LIVE) {
      router.push(`/webinar/${webinarId}/live`);
    }
  };

  const handleGoLive = () => {
    router.push(`/webinar/${webinarId}/live`);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main
      className="relative bg-black min-h-screen flex items-center justify-center py-12 px-4 md:px-10 overflow-x-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

        {/* ───── Left: Event Details & Timer ───── */}
        <div className="flex flex-col space-y-12 w-full">

          {/* Brand + Badge */}
          <div className="flex items-center space-x-5">
            <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              Spotlight
            </span>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center space-x-2 border border-white px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[11px] font-mono uppercase tracking-widest">Live Event</span>
            </div>
          </div>

          {/* Title & Presenter */}
          <div className="space-y-6">
            <h1
              className="text-white font-bold tracking-tighter leading-tight"
              style={{ fontFamily: "Geist, sans-serif", fontSize: "clamp(32px,6vw,64px)", lineHeight: 1.1 }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-zinc-500 text-lg font-medium max-w-2xl" style={{ fontFamily: "Geist, sans-serif" }}>
                {description}
              </p>
            )}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                {presenterName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-base font-medium" style={{ fontFamily: "Geist, sans-serif" }}>
                  {presenterName}
                </p>
                <p className="text-zinc-500 text-sm" style={{ fontFamily: "Geist, sans-serif" }}>
                  {new Date(startTime).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="space-y-4">
            <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest">Starts In</p>
            <div className="flex flex-wrap gap-4 items-start">
              {[
                { label: "Days", value: pad(timeLeft.days) },
                { label: "Hours", value: pad(timeLeft.hours) },
                { label: "Mins", value: pad(timeLeft.minutes) },
                { label: "Secs", value: pad(timeLeft.seconds) },
              ].map((unit, i, arr) => (
                <div key={unit.label} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-black border border-zinc-800 flex items-center justify-center">
                      <span className="text-white font-mono font-bold" style={{ fontSize: "clamp(28px,4vw,48px)" }}>
                        {unit.value}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest mt-2">{unit.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-zinc-700 font-bold text-4xl mt-2">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ───── Right: Action Card ───── */}
        <div className="w-full max-w-[480px] mx-auto lg:ml-auto">
          <div className="relative bg-zinc-950 border border-zinc-800 p-8 min-h-[420px] flex flex-col justify-center overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-20" />

            {!attendeeId ? (
              /* ─── Registration ─── */
              <RegistrationForm webinarId={webinarId} onSuccess={handleRegistrationSuccess} />

            ) : webinarStatus === WebinarStatusEnum.LIVE ? (
              /* ─── Live CTA ─── */
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 flex items-center justify-center border border-white bg-black">
                  <span className="w-4 h-4 rounded-full bg-white animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                    We&apos;re Live!
                  </h2>
                  <p className="text-zinc-400 text-sm" style={{ fontFamily: "Geist, sans-serif" }}>
                    The broadcast has started. Join now.
                  </p>
                </div>
                <button
                  onClick={handleGoLive}
                  className="w-full bg-white text-black font-semibold py-3 px-4 hover:bg-zinc-200 transition-colors text-sm"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  Join Live Stream →
                </button>
              </div>

            ) : webinarStatus === WebinarStatusEnum.ENDED ? (
              /* ─── Ended ─── */
              <div className="flex flex-col items-center text-center space-y-6">
                <CheckCircle2 className="w-12 h-12 text-zinc-500" />
                <div className="space-y-2">
                  <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                    Webinar Concluded
                  </h2>
                  <p className="text-zinc-400 text-sm" style={{ fontFamily: "Geist, sans-serif" }}>
                    This event has ended. Thank you for your interest! Keep an eye on your inbox for follow-up materials.
                  </p>
                </div>
                <div className="w-full h-px bg-zinc-800" />
                <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">See you at the next one</p>
              </div>

            ) : (
              /* ─── Waiting Room ─── */
              <WaitingRoom
                webinarId={webinarId}
                webinarTitle={title}
                startTime={startTime}
                onLive={handleGoLive}
              />
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
