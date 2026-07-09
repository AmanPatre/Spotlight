"use client";

import React, { useState, useMemo } from "react";
import { ArrowRight, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { WebinarStatusEnum } from "@prisma/client";

type Webinar = {
    id: string;
    title: string;
    status: WebinarStatusEnum;
    date: Date;
    totalAttendees: number;
    convertedCount: number;
    summary: string;
    pipelineValue: number;
};

type Props = {
    webinars: Webinar[];
};

type FilterType = "all" | "week" | "month" | "recent";

export default function LeadPageClient({ webinars }: Props) {
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredWebinars = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        let result = [...webinars];

        // Always sort by date descending (most recent first)
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (filter === "week") {
            result = result.filter(w => new Date(w.date) >= oneWeekAgo);
        } else if (filter === "month") {
            result = result.filter(w => new Date(w.date) >= oneMonthAgo);
        } else if (filter === "recent") {
            result = result.slice(0, 3);
        }

        return result;
    }, [webinars, filter]);

    const filterOptions: { label: string; value: FilterType }[] = [
        { label: "All Time", value: "all" },
        { label: "Recent", value: "recent" },
        { label: "Past Week", value: "week" },
        { label: "Past Month", value: "month" },
    ];

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 text-[10px] font-mono uppercase tracking-widest mr-2">
                    <Filter className="w-3 h-3" />
                    Filter By
                </div>
                {filterOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-widest transition-all border",
                            filter === opt.value
                                ? "bg-white text-black border-white font-bold"
                                : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
                <div className="ml-auto text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
                    Showing {filteredWebinars.length} Results
                </div>
            </div>

            {filteredWebinars.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">No webinars found for this period</p>
                    <button
                        onClick={() => setFilter("all")}
                        className="text-xs text-zinc-600 mt-4 underline hover:text-zinc-400"
                    >
                        Reset to All Time
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredWebinars.map((webinar) => (
                        <div
                            key={webinar.id}
                            className="group bg-[#141313] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col h-full relative"
                        >
                            {/* Card Header */}
                            <div className="p-4 lg:p-6 pb-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1 truncate pr-2">
                                        <h3 className="font-semibold text-white leading-tight group-hover:text-white/90 transition-colors truncate" style={{ fontFamily: "Geist, sans-serif" }}>
                                            {webinar.title}
                                        </h3>
                                        <p className="text-[10px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                                            {new Date(webinar.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>

                                    {webinar.status === WebinarStatusEnum.LIVE ? (
                                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-mono font-bold text-red-500 uppercase">LIVE</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded shrink-0">
                                            <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">VOD</span>
                                        </div>
                                    )}
                                </div>

                                {/* Main Stats Row */}
                                <div className="flex flex-wrap items-baseline justify-between gap-y-4 gap-x-2 sm:gap-x-4 my-6">
                                    <div className="space-y-1">
                                        <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest block truncate">Attendees</span>
                                        <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{webinar.totalAttendees.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest block truncate">Converted</span>
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                        </div>
                                        <p className="text-xl sm:text-2xl font-semibold text-emerald-400 tracking-tight">{webinar.convertedCount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest block truncate">Pipeline</span>
                                        <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight truncate">
                                            {formatCurrency(webinar.pipelineValue)}
                                        </p>
                                    </div>
                                </div>

                                {/* AI Summary Snippet */}
                                <div className="relative overflow-hidden pt-4 border-t border-zinc-900">
                                    <p className="text-xs leading-relaxed text-zinc-400 line-clamp-4 min-h-[5rem]" style={{ fontFamily: "Geist, sans-serif" }}>
                                        {webinar.summary}
                                    </p>
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#141313] to-transparent pointer-events-none" />
                                </div>
                            </div>

                            <div className="mt-auto p-6 pt-2">
                                <Link
                                    href={`/lead/${webinar.id}`}
                                    className="flex items-center justify-between w-full text-white font-mono text-[11px] uppercase tracking-widest py-3 border-t border-zinc-800 group-hover:border-zinc-700 transition-colors"
                                >
                                    <span>View Pipeline</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
