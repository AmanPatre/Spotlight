"use client";

import { useEffect, useState, useRef } from "react";
import { getWebinarStatus } from "@/actions/webinar";
import { WebinarStatusEnum } from "@prisma/client";
import { toast } from "sonner";

type Props = {
  webinarId: string;
  webinarTitle: string;
  startTime: Date;
  onLive: () => void;
};

export default function WaitingRoom({ webinarId, webinarTitle, startTime, onLive }: Props) {
  const [status, setStatus] = useState<WebinarStatusEnum>(WebinarStatusEnum.WAITING_ROOM);
  const [webinarStartTime, setWebinarStartTime] = useState<Date>(startTime);
  const onLiveRef = useRef(onLive);

  useEffect(() => {
    onLiveRef.current = onLive;
  }, [onLive]);

  // Poll every 5 seconds for status AND startTime
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await getWebinarStatus(webinarId);
      if (data) {
        setStatus(data.status as WebinarStatusEnum);

        const newStartTime = new Date(data.startTime);
        if (newStartTime.getTime() !== webinarStartTime.getTime()) {
          setWebinarStartTime(newStartTime);
        }

        if (data.status === WebinarStatusEnum.LIVE) {
          clearInterval(interval);
          setTimeout(() => onLiveRef.current(), 2000);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [webinarId, webinarStartTime]);

  const handleAddToCalendar = () => {
    const start = new Date(webinarStartTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1hr
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(webinarTitle)}&dates=${fmt(start)}/${fmt(end)}`;
    window.open(url, "_blank");
    toast.success("Opening Google Calendar...");
  };

  return (
    <div className="flex flex-col h-full justify-center space-y-8 w-full">
      <div className="flex flex-col items-center text-center space-y-6">

        {/* Check icon */}
        <div className="w-16 h-16 border border-white bg-black flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2
            className="text-white text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Ticket Confirmed
          </h2>
          <p
            className="text-zinc-400 text-sm max-w-[280px] mx-auto"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Connection established. Waiting for host broadcast to begin...
          </p>
        </div>

        {/* Standby badge */}
        <div className="flex items-center justify-center space-x-2 bg-zinc-900 border border-zinc-800 px-4 py-2 w-full max-w-[240px]">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white font-mono text-[13px]">
            {status === WebinarStatusEnum.WAITING_ROOM ? "Standby Mode" : "Host preparing..."}
          </span>
        </div>
      </div>

      {/* Add to Calendar */}
      <div className="pt-6 border-t border-zinc-800 w-full">
        <button
          onClick={handleAddToCalendar}
          className="w-full bg-transparent border border-zinc-800 text-white py-3 px-4 hover:bg-zinc-900 hover:border-zinc-700 transition-colors flex items-center justify-center space-x-2 text-sm"
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Add to Calendar</span>
        </button>
      </div>
    </div>
  );
}
