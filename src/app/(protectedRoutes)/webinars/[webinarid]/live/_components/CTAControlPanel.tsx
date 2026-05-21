"use client";

import { useState } from "react";
import { Zap, PhoneCall, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CtaTypeEnum } from "@/generated/prisma/enums";

type CTAType = "BUY_NOW" | "BOOK_A_CALL";

type Props = {
  call: any;
  aiAgentId: string | null;
  ctaType: CtaTypeEnum;
};

export default function CTAControlPanel({ call, aiAgentId, ctaType }: Props) {
  const [sending, setSending] = useState<CTAType | null>(null);

  const sendCTA = async (ctaType: CTAType) => {
    if (!call) {
      toast.error("Stream call not ready");
      return;
    }
    setSending(ctaType);
    try {
      await call.sendCustomEvent({ type: "CTA_TRIGGERED", ctaType });
      toast.success(
        ctaType === "BUY_NOW"
          ? "Buy Now CTA sent to all attendees!"
          : "Book a Call CTA sent to all attendees!"
      );
    } catch (err) {
      console.error("CTA send error", err);
      toast.error("Failed to send CTA. Try again.");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-primary">
          Drop a CTA to Attendees
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Clicking a button will instantly show a banner to all live attendees.
      </p>

      <div className="flex items-center gap-3">
        {ctaType === CtaTypeEnum.BUY_NOW && (
          <button
            onClick={() => sendCTA("BUY_NOW")}
            disabled={!!sending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600/20 border border-green-600/40 text-green-400 text-sm font-medium hover:bg-green-600/30 transition-all disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            {sending === "BUY_NOW" ? "Sending..." : "Drop Buy Now"}
          </button>
        )}

        {ctaType === CtaTypeEnum.BOOK_A_CALL && aiAgentId && (
          <button
            onClick={() => sendCTA("BOOK_A_CALL")}
            disabled={!!sending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-400 text-sm font-medium hover:bg-purple-600/30 transition-all disabled:opacity-50"
          >
            <PhoneCall className="w-4 h-4" />
            {sending === "BOOK_A_CALL" ? "Sending..." : "Drop Book a Call"}
          </button>
        )}
      </div>

      {!aiAgentId && (
        <p className="text-xs text-amber-400/80">
          ⚠️ "Book a Call" CTA is hidden — no AI agent configured for this
          webinar.
        </p>
      )}
    </div>
  );
}
