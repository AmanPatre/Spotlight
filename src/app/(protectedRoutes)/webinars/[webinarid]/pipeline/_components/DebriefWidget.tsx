import React from "react";
import { Badge } from "@/components/ui/badge";
import { FlameIcon, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Debrief {
    score: number;
    summary: string | null;
    isHotLead: boolean;
    attendance: {
        attendeeId: string;
        user?: { name: string };
    };
}

interface Props {
    debriefs: Debrief[];
    totalAttendeesCount: number;
    price: number;
    currency: string;
}

export default function DebriefWidget({ debriefs, totalAttendeesCount, price, currency }: Props) {
    if (!debriefs || debriefs.length === 0) return null;

    const hotLeads = debriefs.filter((d) => d.score >= 8 || d.isHotLead);
    const hotLeadsCount = hotLeads.length;

    // Extract names of the hot leads for actionable insights
    const hotLeadNames = hotLeads
        .map(h => h.attendance.user?.name)
        .filter(Boolean)
        .slice(0, 3);

    const namesList = hotLeadNames.length > 0
        ? (hotLeadNames.length === 1
            ? hotLeadNames[0]
            : hotLeadNames.slice(0, -1).join(", ") + " and " + hotLeadNames[hotLeadNames.length - 1])
        : "";

    // Use actual price for pipeline calculation
    const pipelineValue = hotLeadsCount * price;

    // Currency symbol handling (Support INR/Rupees as per request)
    const currencySymbol = currency === "INR" || currency === "Rupees" ? "₹" : "$";

    return (
        <div className="w-full bg-[#141414] border border-[#27272a] p-8 rounded-3xl mb-10 flex flex-col md:flex-row shadow-2xl gap-8 justify-between items-stretch relative overflow-hidden group">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-emerald-500/5 opacity-50 pointer-events-none" />

            {/* Left side stats */}
            <div className="relative flex flex-col sm:flex-row gap-8 md:gap-14 w-full md:w-auto z-10">
                <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a]">Total AI Debriefs</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-white tracking-tighter">{debriefs.length}</p>
                        <span className="text-sm font-medium text-[#71717a] uppercase tracking-wide">/ {totalAttendeesCount} calls</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a]">Hot Leads</p>
                    <div className="flex items-center gap-3">
                        <p className="text-4xl font-black text-white tracking-tighter">{hotLeadsCount}</p>
                        {hotLeadsCount > 0 && (
                            <Badge variant="default" className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full font-bold shadow-none">
                                <FlameIcon className="w-3.5 h-3.5 mr-1.5" />
                                Score 8+
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a]">Pipeline Value</p>
                        <TrendingUp className="w-3 h-3 text-emerald-500 opacity-60" />
                    </div>
                    <p className="text-4xl font-black text-emerald-400 tracking-tighter">
                        {currencySymbol}{pipelineValue.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Actionable Insight Card */}
            <div className="relative w-full md:w-[45%] bg-black/40 p-6 rounded-2xl border border-[#27272a] group-hover:border-white/10 transition-colors z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <p className="font-bold text-[13px] uppercase tracking-widest text-[#a1a1aa]">Actionable Insight</p>
                </div>
                <p className="text-[#fafafa]/80 leading-relaxed text-[13.5px] font-medium italic">
                    {hotLeadsCount > 0
                        ? `AI identified ${hotLeadsCount} attendees with immediate intent. High-priority: ${namesList}.`
                        : "The AI agent has summarized the session. No high-intent leads identified yet. Keep nurturing mid-tier participants."}
                </p>
            </div>
        </div>
    );
}
