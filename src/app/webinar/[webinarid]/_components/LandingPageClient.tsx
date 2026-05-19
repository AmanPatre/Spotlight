"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WebinarStatusEnum } from "@/generated/prisma/enums";
import RegistrationForm from "./RegistrationForm";
import WaitingRoom from "./WaitingRoom";
import { Calendar, User, Clock } from "lucide-react";

type Props = {
  webinarId: string;
  title: string;
  description: string;
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

  useEffect(() => {
    // Check if user is already registered in this browser
    const storedId = localStorage.getItem(`spotlight_attendee_${webinarId}`);
    if (storedId) {
      setAttendeeId(storedId);
    }

    // If already live and registered, go straight to live
    if (storedId && webinarStatus === WebinarStatusEnum.LIVE) {
      router.push(`/webinar/${webinarId}/live`);
    }
  }, [webinarId, webinarStatus, router]);

  const handleRegistrationSuccess = (id: string) => {
    setAttendeeId(id);
    if (webinarStatus === WebinarStatusEnum.LIVE) {
      router.push(`/webinar/${webinarId}/live`);
    }
  };

  const handleGoLive = () => {
    router.push(`/webinar/${webinarId}/live`);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center pt-20 pb-20 px-6">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] pointer-events-none rounded-full" />

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Content Column */}
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-bold text-purple-400 uppercase tracking-widest w-fit">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Special Live Event
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <p className="font-medium text-primary">
                {new Date(startTime).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <p className="font-medium text-primary">
                Starts at{" "}
                {new Date(startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                  {presenterName.charAt(0)}
                </div>
              </div>
              <p className="font-medium">
                Hosted by <span className="text-primary">{presenterName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="w-full lg:sticky lg:top-24">
          {!attendeeId ? (
            <div className="p-8 rounded-3xl border border-border bg-secondary/10 backdrop-blur-md shadow-2xl">
              <RegistrationForm
                webinarId={webinarId}
                onSuccess={handleRegistrationSuccess}
              />
            </div>
          ) : (
            <div className="w-full">
              {webinarStatus === WebinarStatusEnum.LIVE ? (
                <div className="flex flex-col items-center justify-center gap-6 p-10 rounded-3xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-md text-center">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-red-500 animate-ping absolute opacity-20" />
                    <span className="w-4 h-4 rounded-full bg-red-500 relative" />
                  </div>
                  <h3 className="text-2xl font-bold">The Event is LIVE</h3>
                  <p className="text-muted-foreground">
                    You&apos;re already registered. Jump in now to join the broadcast!
                  </p>
                  <button
                    onClick={handleGoLive}
                    className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all shadow-xl shadow-red-500/20"
                  >
                    Join Live Stream
                  </button>
                </div>
              ) : (
                <WaitingRoom
                  webinarId={webinarId}
                  webinarTitle={title}
                  startTime={startTime}
                  onLive={handleGoLive}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto pt-20 text-center opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-xs uppercase tracking-tighter">
          Powered by Spotlight — Next-Gen AI Webinars
        </p>
      </footer>
    </div>
  );
}
