"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Wallet } from "lucide-react";

type Props = {
    convertedCount: number;
    hotLeadsCount: number; // For Display stat
    unconvertedHotLeadsCount: number; // For Projection calculation
    totalAttendeesCount: number;
    price: number;
    currency: string;
};

export default function PipelineValueToggle({
    convertedCount,
    hotLeadsCount,
    unconvertedHotLeadsCount,
    totalAttendeesCount,
    price,
    currency,
}: Props) {
    const [showProjected, setShowProjected] = useState(false);

    const actualValue = convertedCount * price;
    const projectedValue = actualValue + (unconvertedHotLeadsCount * price);

    return (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex gap-4">
                <StatCard
                    label="Total Attendees"
                    value={totalAttendeesCount}
                />
                <StatCard
                    label="Converted"
                    value={convertedCount}
                    color="emerald"
                />
                <StatCard
                    label="Hot Leads"
                    value={hotLeadsCount}
                    highlighted
                />
                <div className="bg-[#141313] border border-zinc-800 p-6 min-w-[200px] space-y-3 relative group overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                            {showProjected ? "Projected Pipeline" : "Actual Revenue"}
                        </span>
                        {showProjected ? (
                            <TrendingUp className="w-3 h-3 text-amber-500" />
                        ) : (
                            <Wallet className="w-3 h-3 text-emerald-500" />
                        )}
                    </div>

                    <p className={`text-2xl font-semibold tracking-tight transition-all duration-300 ${showProjected ? 'text-amber-500' : 'text-white'}`}>
                        {formatCurrency(showProjected ? projectedValue : actualValue)}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={() => setShowProjected(!showProjected)}
                            className={`text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-1 rounded transition-all border ${showProjected
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
                                }`}
                        >
                            {showProjected ? "Switch to Actual" : "View Projected"}
                        </button>
                    </div>

                    {/* Subtle background glow for projected mode */}
                    {showProjected && (
                        <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, highlighted = false, color }: { label: string, value: string | number, highlighted?: boolean, color?: "emerald" }) {
    const valueColor = color === "emerald" ? "text-emerald-400" : highlighted ? "text-white" : "text-zinc-300";
    return (
        <div className="bg-[#141313] border border-zinc-800 p-6 min-w-[160px] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">{label}</span>
            <p className={`text-2xl font-semibold tracking-tight ${valueColor}`}>
                {value}
            </p>
        </div>
    );
}
