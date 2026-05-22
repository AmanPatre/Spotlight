import { Webinar } from "@/generated/prisma/client";
import { PipelineIcon } from "@/icons/PipelineIcon";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import React from "react";

type Props = {
  webinar: Webinar;
};

const statusColor = (status: string) => {
  switch (status) {
    case "LIVE": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "SCHEDULED":
    case "WAITING_ROOM":
    case "UPCOMING": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "ENDED": return "bg-zinc-900 text-zinc-500 border-zinc-800";
    default: return "bg-zinc-900 text-zinc-500 border-zinc-800";
  }
};

const WebinarCard = ({ webinar }: Props) => {
  const getDisplayStatus = (status: string) => {
    switch (status) {
      case "LIVE": return "LIVE";
      case "ENDED": return "ENDED";
      default: return "UPCOMING";
    }
  };

  const status = webinar.webinarStatus;
  const displayStatus = getDisplayStatus(status);
  return (
    <div className="group flex gap-3 flex-col items-start w-full rounded-lg border border-[#27272a] bg-[#18181b] overflow-hidden hover:border-[#3f3f46] transition-colors">
      {/* Thumbnail */}
      <Link href={`/webinars/${webinar?.id}`} className="w-full">
        <div className="relative w-full aspect-video overflow-hidden bg-[#0e0e10]">
          <Image
            src={"/darkthumbnail.png"}
            alt="webinar"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Status badge */}
          <span className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${statusColor(displayStatus)} shadow-lg`}>
            {displayStatus === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
            {displayStatus}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="w-full px-4 pb-4 flex justify-between gap-3 items-start">
        <Link href={`/webinars/${webinar?.id}`} className="flex flex-col gap-1.5 flex-1 min-w-0">
          <p className="text-sm font-medium text-[#fafafa] truncate">{webinar?.title}</p>
          {webinar?.description && (
            <p className="text-xs text-[#71717a] line-clamp-2">{webinar?.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-[#52525b]">
              <Calendar className="w-3 h-3" />
              {format(new Date(webinar?.startTime), "dd/MM/yyyy")}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#52525b]">
              <Clock className="w-3 h-3" />
              {format(new Date(webinar?.startTime), "HH:mm")}
            </span>
          </div>
        </Link>

        <Link
          href={`/webinars/${webinar?.id}/pipeline`}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md border border-[#27272a] bg-[#0e0e10] hover:bg-[#27272a] hover:border-violet-500/40 text-[#a1a1aa] hover:text-violet-400 transition-colors"
        >
          <PipelineIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default WebinarCard;
