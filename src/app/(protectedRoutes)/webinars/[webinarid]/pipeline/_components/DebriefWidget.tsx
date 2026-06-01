"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FlameIcon, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
    convertedCount: number;
    unconvertedHotLeadsCount: number;
}

export default function DebriefWidget({
    debriefs,
    totalAttendeesCount,
    price,
    currency,
    convertedCount,
    unconvertedHotLeadsCount
}: Props) {
    const [showProjected, setShowProjected] = useState(false);

    if (!debriefs || debriefs.length === 0) return null;

    const hotLeads = debriefs.filter((d) => d.score >= 8);
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

    // Calculation logic
    const actualValue = convertedCount * price;
    const projectedValue = actualValue + (unconvertedHotLeadsCount * price);

    return (
        <div className="w-full bg-[#141414] border border-[#27272a] p-6 rounded-3xl mb-6 flex flex-col md:flex-row shadow-2xl gap-6 justify-between items-stretch relative overflow-hidden group">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-zinc-500/5 opacity-50 pointer-events-none" />

            {/* Left side stats */}
            <div className="relative flex flex-col sm:flex-row gap-6 md:gap-10 w-full md:w-auto z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717a]">Total AI Debriefs</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-white tracking-tighter">{debriefs.length}</p>
                        <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">/ {totalAttendeesCount} calls</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717a]">Converted</p>
                    <div className="flex items-center gap-3">
                        <p className="text-3xl font-black text-emerald-400 tracking-tighter">{convertedCount}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717a]">Hot Leads</p>
                    <div className="flex items-center gap-3">
                        <p className="text-3xl font-black text-white tracking-tighter">{unconvertedHotLeadsCount}</p>
                        {unconvertedHotLeadsCount > 0 && (
                            <Badge variant="default" className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-bold shadow-none text-[10px]">
                                <FlameIcon className="w-3 h-3 mr-1" />
                                Score 8+
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-1 relative group/stat">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717a]">
                            {showProjected ? "Projected Pipeline" : "Actual Pipeline"}
                        </p>
                        {showProjected ? (
                            <TrendingUp className="w-2.5 h-2.5 text-amber-500" />
                        ) : (
                            <Wallet className="w-2.5 h-2.5 text-emerald-500" />
                        )}
                    </div>
                    <p className={`text-3xl font-black tracking-tighter transition-all duration-300 ${showProjected ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {formatCurrency(showProjected ? projectedValue : actualValue)}
                    </p>
                    <button
                        onClick={() => setShowProjected(!showProjected)}
                        className={`mt-1 text-[8px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded transition-all border ${showProjected
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
                            }`}
                    >
                        {showProjected ? "Switch to Actual" : "View Projected"}
                    </button>

                    {showProjected && (
                        <div className="absolute -inset-2 bg-amber-500/5 blur-xl rounded-full pointer-events-none -z-10" />
                    )}
                </div>
            </div>

            {/* Actionable Insight Card */}
            <div className="relative w-full md:w-[42%] bg-black/40 p-5 rounded-2xl border border-[#27272a] group-hover:border-white/10 transition-colors z-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <p className="font-bold text-[11px] uppercase tracking-widest text-[#a1a1aa]">Actionable Insight</p>
                </div>
                <p className="text-[#fafafa]/80 leading-relaxed text-[12.5px] font-medium italic">
                    {unconvertedHotLeadsCount > 0
                        ? `AI identified ${unconvertedHotLeadsCount} unconverted high-intent leads. High-priority: ${namesList}.`
                        : "The AI agent has summarized the session. No high-intent leads identified yet. Keep nurturing mid-tier participants."}
                </p>
            </div>
        </div>
    );
}
