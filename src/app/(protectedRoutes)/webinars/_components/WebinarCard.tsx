import { Webinar } from "@prisma/client";
import { Calendar, Clock, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import React from "react";

type Props = {
  webinar: Webinar;
};

const WebinarCard = ({ webinar }: Props) => {
  const getDisplayStatus = (status: string, startTime: Date) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (status === "SCHEDULED" && new Date(startTime) <= oneHourAgo) {
      return "MISSED";
    }

    switch (status) {
      case "LIVE": return "LIVE";
      case "ENDED": return "ENDED";
      default: return "UPCOMING";
    }
  };

  const status = webinar.webinarStatus;
  const displayStatus = getDisplayStatus(status, webinar.startTime);

  return (
    <div className="group w-full bg-[#0e0e0e] border border-[#2e2e2e] rounded-xl overflow-hidden hover:border-[#ffffff]/20 transition-all duration-300 flex flex-col h-[280px]">
      <Link href={`/webinars/${webinar?.id}`} className="relative flex-1 bg-[#141313] flex items-center justify-center p-4 border-b border-[#2e2e2e]">
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#363535] text-[#a1a1aa] border border-[#2e2e2e]">
            {displayStatus === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
            {displayStatus}
          </span>
        </div>
        <div className="w-20 h-20 relative rounded-full bg-[#0e0e0e] border border-[#2e2e2e] shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden">
          <Image
            src={"/darkthumbnail.png"}
            alt="webinar"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="p-5 bg-[#0e0e0e]">
        <div className="flex items-start justify-between gap-4 mb-2">
          <Link href={`/webinars/${webinar?.id}`} className="block flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#ffffff] truncate">{webinar?.title}</h3>
            {webinar?.description && (
              <p className="text-sm text-[#a1a1aa] truncate mt-0.5">{webinar?.description}</p>
            )}
          </Link>
          <Link
            href={`/webinars/${webinar?.id}/pipeline`}
            className="shrink-0 w-8 h-8 rounded bg-[#1c1b1b] border border-[#2e2e2e] flex items-center justify-center text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#3a3939] transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#a1a1aa] mt-4">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(webinar?.startTime), "dd/MM/yyyy")}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(webinar?.startTime), "HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebinarCard;
