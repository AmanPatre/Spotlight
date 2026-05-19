"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  PhoneCall,
  X,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import { updateAttendanceStatus } from "@/actions/attendence";
import { AttendedTypeEnum } from "@/generated/prisma/enums";
import { toast } from "sonner";

type CTAType = "BUY_NOW" | "BOOK_A_CALL";

type Props = {
  type: CTAType;
  webinarId: string;
  attendeeId: string;
  aiAgentId: string | null;
  onClose: () => void;
};

const CTA_CONFIG = {
  BUY_NOW: {
    icon: ShoppingBag,
    label: "Limited Time Offer",
    title: "Claim Your Discount Now",
    description: "Get immediate access to the full course + exclusive bonuses. Offer expires when the stream ends!",
    actionLabel: "Get Instant Access",
    gradient: "from-emerald-500/20 to-teal-500/5",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    buttonClass: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20",
    attendedType: AttendedTypeEnum.ADDED_TO_CART,
  },
  BOOK_A_CALL: {
    icon: PhoneCall,
    label: "Strategy Session",
    title: "Book Your 1-on-1 Call",
    description: "Speak directly with our experts to map out your personalized growth plan. Only 3 spots left!",
    actionLabel: "Reserve My Spot",
    gradient: "from-purple-600/20 to-indigo-600/5",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    buttonClass: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20",
    attendedType: AttendedTypeEnum.BREAKOUT_ROOM,
  },
} as const;

export default function CTABanner({
  type,
  webinarId,
  attendeeId,
  aiAgentId,
  onClose,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const config = CTA_CONFIG[type];
  const Icon = config.icon;

  const actionLabel =
    type === "BOOK_A_CALL" && aiAgentId
      ? "Join breakout room"
      : config.actionLabel;

  const handleAction = async () => {
    if (type === "BOOK_A_CALL" && !aiAgentId) {
      toast.error("The host has not connected an AI agent for this session.");
      return;
    }

    setLoading(true);
    try {
      await updateAttendanceStatus(webinarId, attendeeId, config.attendedType);

      if (type === "BUY_NOW") {
        onClose();
        router.push(`/webinar/${webinarId}/checkout?attendeeId=${attendeeId}`);
      } else if (aiAgentId) {
        toast.success("Opening your AI strategy session…");
        onClose();
        router.push(`/webinar/${webinarId}/call`);
      } else {
        toast.success("Consultation requested! Check your email for details.");
        onClose();
      }
    } catch {
      toast.error("Connection lost. Please try clicking again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        relative w-full rounded-[2rem] border backdrop-blur-2xl p-6
        bg-gradient-to-br ${config.gradient} ${config.border}
        shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10
      `}
    >
      {/* Sparkle Decoration */}
      <div className="absolute -top-3 -left-3 p-2 bg-zinc-900 rounded-full border border-white/10 shadow-lg">
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all duration-300"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Icon & Label */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-4 rounded-2xl bg-zinc-950/80 border border-white/5 shadow-inner shrink-0 ${config.iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-1 border border-white/5">
              {config.label}
            </span>
            <h3 className="text-lg font-black text-white leading-tight mb-1">
              {config.title}
            </h3>
            <p className="text-[13px] text-zinc-400 font-medium leading-relaxed max-w-md">
              {config.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={loading}
          className={`
            w-full md:w-auto shrink-0 flex items-center justify-center gap-2
            px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest
            transition-all duration-500 active:scale-95 disabled:opacity-50
            ${config.buttonClass}
          `}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          {loading ? "Processing..." : actionLabel}
        </button>
      </div>
    </div>
  );
}
