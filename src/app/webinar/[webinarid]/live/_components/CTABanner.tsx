"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, PhoneCall, Loader2, X } from "lucide-react";
import { updateAttendanceStatus } from "@/actions/attendence";
import { AttendedTypeEnum } from "@prisma/client";
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
    label: "Exclusive Offer",
    title: "Unlock Lifetime Access",
    description: "Get immediate access to the full course + exclusive bonuses. Offer expires when the stream ends!",
    actionLabel: "Complete Purchase",
    attendedType: AttendedTypeEnum.ADDED_TO_CART,
  },
  BOOK_A_CALL: {
    icon: PhoneCall,
    label: "Strategy Session",
    title: "Book Your 1-on-1 Call",
    description: "Speak directly with our experts to map out your personalized growth plan. Only 3 spots left!",
    actionLabel: "Reserve My Spot",
    attendedType: AttendedTypeEnum.BREAKOUT_ROOM,
  },
} as const;

export default function CTABanner({ type, webinarId, attendeeId, aiAgentId, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const config = CTA_CONFIG[type];
  const Icon = config.icon;

  const actionLabel =
    type === "BOOK_A_CALL" && aiAgentId ? "Join Breakout Room" : config.actionLabel;

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
    <div className="w-full bg-zinc-950 border border-zinc-800 p-8 shadow-2xl flex flex-col gap-6 relative">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-start">
        <div>
          <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest block mb-2">
            {config.label}
          </span>
          <h2 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
            {config.title}
          </h2>
        </div>
      </div>

      <p className="text-sm text-zinc-400" style={{ fontFamily: "Geist, sans-serif" }}>
        {config.description}
      </p>

      <button
        onClick={handleAction}
        disabled={loading}
        className="w-full bg-white text-black font-mono text-[11px] uppercase tracking-widest py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
        {loading ? "Processing..." : actionLabel}
      </button>
    </div>
  );
}
