"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";

type Props = {
    convertedCount: number;
    hotLeadsCount: number; // For Display stat
    totalAttendeesCount: number;
    price: number;
    currency: string;
};

export default function PipelineValueToggle({
    convertedCount,
    hotLeadsCount,
    totalAttendeesCount,
    price,
    currency,
}: Props) {
    const actualValue = convertedCount * price;

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
                            Actual Revenue
                        </span>
                        <Wallet className="w-3 h-3 text-emerald-500" />
                    </div>

                    <p className="text-2xl font-semibold tracking-tight text-white transition-all duration-300">
                        {formatCurrency(actualValue)}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                        <div className="text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            Verified Revenue
                        </div>
                    </div>
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
