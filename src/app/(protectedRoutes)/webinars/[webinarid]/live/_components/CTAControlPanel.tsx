"use client";

import { useState } from "react";
import { Zap, PhoneCall, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CtaTypeEnum } from "@prisma/client";

import { Call } from "@stream-io/video-react-sdk";

type CTAType = "BUY_NOW" | "BOOK_A_CALL";

type Props = {
  call: Call | undefined;
  aiAgentId: string | null;
  ctaType: CtaTypeEnum;
  ctaLabel?: string | null;
  productTitle?: string | null;
  price?: number | null;
};

export default function CTAControlPanel({
  call,
  aiAgentId,
  ctaType,
  ctaLabel,
  productTitle,
  price,
}: Props) {
  const [sending, setSending] = useState<CTAType | null>(null);

  const sendCTA = async (ctaType: CTAType) => {
    if (!call) {
      toast.error("Stream call not ready");
      return;
    }
    setSending(ctaType);
    try {
      await call.sendCustomEvent({
        type: "CTA_TRIGGERED",
        ctaType,
        ctaMetadata: {
          ctaLabel,
          productTitle,
          price,
        }
      });
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
    <div className="px-6 py-6 rounded-2xl border border-white/5 bg-[#171717] flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <Zap className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />
        <h3 className="text-[15px] font-semibold text-white">
          Drop a CTA to Attendees
        </h3>
      </div>

      <p className="text-[14px] leading-relaxed text-[#9ca3af] pr-6">
        Clicking a button will instantly show a banner to all live attendees.
      </p>

      <div className="flex flex-col gap-3 mt-3">
        {ctaType === CtaTypeEnum.BUY_NOW && (
          <button
            onClick={() => sendCTA("BUY_NOW")}
            disabled={!!sending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#064e3b] border border-[#047857] text-[#6ee7b7] text-[14px] font-medium hover:bg-[#065f46] transition-all disabled:opacity-50"
          >
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2} />
            {sending === "BUY_NOW" ? "Sending..." : "Drop Buy Now"}
          </button>
        )}

        {ctaType === CtaTypeEnum.BOOK_A_CALL && aiAgentId && (
          <button
            onClick={() => sendCTA("BOOK_A_CALL")}
            disabled={!!sending}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-[#2e1549] border border-[#522985] text-[#d8b4fe] text-[14px] font-medium hover:bg-[#3d1c61] transition-all disabled:opacity-50"
          >
            <PhoneCall className="w-[18px] h-[18px]" strokeWidth={2} />
            {sending === "BOOK_A_CALL" ? "Sending..." : "Drop Book a Call"}
          </button>
        )}
      </div>

      {!aiAgentId && (
        <p className="text-[11px] text-yellow-500/80">
          ⚠️ &quot;Book a Call&quot; CTA is hidden &mdash; no AI agent configured for this
          webinar.
        </p>
      )}
    </div>
  );
}
