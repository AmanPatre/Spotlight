"use client";

import { WebinarStatusEnum } from "@/generated/prisma/enums";
import { format } from "date-fns";
import { CalendarDays, Clock, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  title: string;
  description: string | null;
  startTime: Date;
  webinarStatus: WebinarStatusEnum;
  presenterName: string;
  webinarId: string;
};

const statusConfig: Record<
  WebinarStatusEnum,
  { label: string; color: string }
> = {
  [WebinarStatusEnum.SCHEDULED]: {
    label: "Scheduled",
    color:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  [WebinarStatusEnum.WAITING_ROOM]: {
    label: "Waiting Room",
    color:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  [WebinarStatusEnum.LIVE]: {
    label: "🔴 Live",
    color:
      "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse",
  },
  [WebinarStatusEnum.ENDED]: {
    label: "Ended",
    color:
      "bg-muted text-muted-foreground border border-border",
  },
  [WebinarStatusEnum.CANCELLED]: {
    label: "Cancelled",
    color:
      "bg-muted text-muted-foreground border border-border",
  },
};

const WebinarDetailHeader = ({
  title,
  description,
  startTime,
  webinarStatus,
  presenterName,
  webinarId,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const attendeeLink = `${baseUrl}/webinar/${webinarId}`;
  const { label, color } = statusConfig[webinarStatus];

  const handleCopy = () => {
    navigator.clipboard.writeText(attendeeLink);
    setCopied(true);
    toast.success("Attendee link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-[#fafafa]">{title}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${color}`}
            >
              {label}
            </span>
          </div>
          <p className="text-[#71717a] text-sm">
            Hosted by{" "}
            <span className="text-violet-400 font-medium">{presenterName}</span>
          </p>
        </div>
      </div>

      {/* Date & Time row */}
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-2 text-[#a1a1aa] text-sm">
          <CalendarDays className="w-4 h-4 text-violet-400" />
          <span>{format(new Date(startTime), "EEEE, MMMM do yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-[#a1a1aa] text-sm">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>{format(new Date(startTime), "hh:mm a")}</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-2xl">
          {description}
        </p>
      )}

      {/* Shareable link */}
      <div className="flex items-center gap-2 p-3 rounded-md bg-[#0e0e10] border border-[#27272a] w-full max-w-xl">
        <ExternalLink className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <span className="text-sm text-[#71717a] truncate flex-1">
          {attendeeLink}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium flex-shrink-0 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default WebinarDetailHeader;
