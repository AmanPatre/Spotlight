import { cn } from "@/lib/utils";
import { Attendee, CallDebrief } from "@/generated/prisma/client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FlameIcon } from "lucide-react";

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
        "flex flex-col w-fit text-primary p-3 pr-10 gap-3 rounded-xl border-[0.5px] border-border backdrop-blur-[20px] bg-background/10",
        debrief?.isHotLead ? "border-orange-500/50 bg-orange-500/5" : "",
        className,
      )}
    >
      <div className="flex justify-between items-start w-full gap-4">
        <div>
          <h3 className="font-semibold text-xs">{customer.name}</h3>
          <p className="text-[12px] opacity-70 truncate max-w-[200px]">{customer.email}</p>
        </div>
        {debrief?.isHotLead && (
          <Badge variant="default" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 shadow-none border-0 px-2 py-0.5">
            <FlameIcon className="w-3 h-3 mr-1" />
            Hot
          </Badge>
        )}
      </div>

      {debrief?.summary && (
        <div className="flex flex-col gap-2 p-2 bg-background/20 rounded-md border border-border/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold opacity-100 text-[10px] uppercase tracking-wider text-orange-500/80">AI Insight</span>
            {/* Score Pill */}
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-sm font-bold border",
              debrief.score >= 8 ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                debrief.score >= 4 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                  "bg-foreground/10 text-foreground/50 border-border"
            )}>
              {debrief.score}/10
            </span>
          </div>
          <p className="text-[11px] leading-tight opacity-70">
            {debrief.summary}
          </p>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-background/50 rounded-full mt-1 overflow-hidden">
            <div
              className={cn("h-full rounded-full",
                debrief.score >= 8 ? "bg-orange-500" :
                  debrief.score >= 4 ? "bg-yellow-500" :
                    "bg-foreground/30"
              )}
              style={{ width: `${debrief.score * 10}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-foreground px-2 py-1 rounded-md border border-border text-[10px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default UserInfoCard;
