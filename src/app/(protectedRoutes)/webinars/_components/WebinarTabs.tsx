"use client";
import { useState } from "react";
import { Webinar } from "@prisma/client";
import WebinarCard from "./WebinarCard";

const TABS = ["All", "Upcoming", "Live", "Ended"] as const;
type Tab = (typeof TABS)[number];

function filterWebinars(webinars: Webinar[], tab: Tab) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    switch (tab) {
        case "Upcoming":
            return webinars.filter((w) =>
                (w.webinarStatus === "SCHEDULED" && new Date(w.startTime) > oneHourAgo) ||
                w.webinarStatus === "WAITING_ROOM"
            );
        case "Live":
            return webinars.filter((w) => w.webinarStatus === "LIVE");
        case "Ended":
            return webinars.filter((w) =>
                w.webinarStatus === "ENDED" ||
                (w.webinarStatus === "SCHEDULED" && new Date(w.startTime) <= oneHourAgo)
            );
        default:
            return webinars;
    }
}
import { useSearchParams } from "next/navigation";

const emptyMessages: Record<Tab, string> = {
    All: "No webinars found",
    Upcoming: "No upcoming webinars",
    Live: "You are not live right now",
    Ended: "No ended webinars",
};

export default function WebinarTabs({ webinars }: { webinars: Webinar[] }) {
    const [active, setActive] = useState<Tab>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const searchParams = useSearchParams();
    const sortParam = searchParams.get('sort') || 'newest';

    const filtered = filterWebinars(webinars, active).filter((w) =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (sortParam === 'oldest') {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        if (sortParam === 'title') {
            return a.title.localeCompare(b.title);
        }
        // Default to newest
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

    return (
        <div className="space-y-6">
            {/* Controls row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    <input
                        className="w-full bg-[#0e0e0e] border border-[#2e2e2e] text-sm text-white rounded-md pl-9 pr-4 py-2 placeholder-[#71717a] focus:outline-none focus:border-white/20"
                        placeholder="Search webinars..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 bg-[#0e0e0e] border border-[#2e2e2e] rounded-lg p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActive(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${active === tab
                                ? "bg-[#3a3939] text-white border border-[#444]"
                                : "text-[#a1a1aa] hover:text-white hover:bg-[#1c1b1b]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.length > 0 ? (
                    filtered.map((webinar, i) => <WebinarCard key={i} webinar={webinar} />)
                ) : (
                    <div className="col-span-full h-48 flex items-center justify-center text-[#71717a] text-base">
                        {emptyMessages[active]}
                    </div>
                )}
            </div>
        </div>
    );
}
