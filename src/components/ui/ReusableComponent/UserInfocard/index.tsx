import { cn } from "@/lib/utils";
import { Attendee, CallDebrief } from "@prisma/client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FlameIcon, User } from "lucide-react";

type Props = {
  customer: Attendee;
  tags: string[];
  className?: string;
  debrief?: CallDebrief;
};

const UserInfoCard = ({ customer, tags, className, debrief }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col w-full text-white p-5 gap-4 rounded-2xl border border-[#27272a] bg-[#18181b]/40 backdrop-blur-xl transition-all hover:bg-[#18181b]/60 hover:border-white/10",
        debrief && debrief.score >= 8 ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50" : "",
        className,
      )}
    >
      <div className="flex justify-between items-start w-full gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#27272a] to-black border border-white/5 flex items-center justify-center">
            <User className="w-5 h-5 text-[#71717a]" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] tracking-tight text-white">{customer.name}</h3>
            <p className="text-[12px] font-medium text-[#71717a] truncate max-w-[180px]">{customer.email}</p>
          </div>
        </div>
        {debrief && debrief.score >= 8 && (
          <Badge variant="default" className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-bold shadow-none">
            <FlameIcon className="w-3 h-3 mr-1.5" />
            Hot
          </Badge>
        )}
      </div>

      {debrief?.summary && (
        <div className="flex flex-col gap-3 p-4 bg-black/40 rounded-xl border border-white/5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-black text-[9px] uppercase tracking-[0.2em] text-[#a1a1aa] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              AI Insight
            </span>
            {/* Score Pill */}
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-black border tracking-wider",
              debrief.score >= 8 ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                debrief.score >= 4 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                  "bg-[#27272a] text-[#71717a] border-white/5"
            )}>
              {debrief.score}/10
            </span>
          </div>

          <p className="text-[12px] leading-relaxed text-[#d1d1d1] font-medium leading-[1.6]">
            {debrief.summary}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500 ease-out",
                debrief.score >= 8 ? "bg-gradient-to-r from-orange-400 to-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.3)]" :
                  debrief.score >= 4 ? "bg-yellow-500" :
                    "bg-[#3f3f46]"
              )}
              style={{ width: `${debrief.score * 10}%` }}
            />
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-[#a1a1aa] px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold tracking-wide uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserInfoCard;
