"use client";

import { WebinarStatusEnum, CtaTypeEnum } from "@/generated/prisma/enums";
import { Bot, Lock, Tag, Ticket } from "lucide-react";

type Props = {
  description: string | null;
  tags: string[];
  ctaType: CtaTypeEnum;
  ctaLabel: string | null;
  aiAgentId: string | null;
  aiAgentName?: string | null;
  couponEnabled: boolean;
  couponCode: string | null;
  lockChat: boolean;
  webinarStatus: WebinarStatusEnum;
};

const WebinarOverviewTab = ({
  description,
  tags,
  ctaType,
  ctaLabel,
  aiAgentId,
  aiAgentName,
  couponEnabled,
  couponCode,
  lockChat,
  webinarStatus,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      {/* Description card */}
      <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-secondary/40">
        <h3 className="text-sm font-semibold text-primary">Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description || "No description provided."}
        </p>
      </div>

      {/* Tags card */}
      <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-primary">Tags</h3>
        </div>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tags added.</p>
        )}
      </div>

      {/* CTA card */}
      <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-primary">Call to Action</h3>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Type:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${ctaType === CtaTypeEnum.BOOK_A_CALL
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
                }`}
            >
              {ctaType === CtaTypeEnum.BOOK_A_CALL ? "Book a Call" : "Buy Now"}
            </span>
          </div>
          {ctaLabel && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Label:</span>
              <span className="text-xs text-primary font-medium">{ctaLabel}</span>
            </div>
          )}
          {ctaType === CtaTypeEnum.BOOK_A_CALL && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">AI Agent:</span>
              <span
                className={`text-xs font-medium ${aiAgentId ? "text-green-400" : "text-amber-400"
                  }`}
              >
                {aiAgentId ? (aiAgentName || "Configured ✓") : "Not configured"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Settings card */}
      <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-primary">Settings</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Chat:</span>
            <span className="text-xs text-primary font-medium">
              {lockChat ? "Locked (host only)" : "Open to all"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Coupon:</span>
            <span className="text-xs text-primary font-medium">
              {couponEnabled && couponCode ? (
                <span className="text-green-400 font-mono">{couponCode}</span>
              ) : (
                "Disabled"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Status:</span>
            <span className="text-xs text-primary font-medium capitalize">
              {webinarStatus.replace("_", " ").toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebinarOverviewTab;
