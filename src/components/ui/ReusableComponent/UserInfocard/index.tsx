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
        <p className="text-[11px] leading-tight opacity-70 p-2 bg-background/20 rounded-md border border-border/50">
          <span className="font-semibold opacity-100 mb-1 block text-[10px] uppercase tracking-wider text-orange-500/80">AI Insight • {debrief.score}/10</span>
          {debrief.summary}
        </p>
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
