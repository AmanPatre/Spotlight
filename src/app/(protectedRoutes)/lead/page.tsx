import { getWebinarLeadsOverview } from "@/actions/attendence";
import { WebinarStatusEnum } from "@/generated/prisma/enums";
import { Loader2, ArrowRight, Video, PlayCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function LeadPage() {
  const { success, webinars } = await getWebinarLeadsOverview();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-12">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white" style={{ fontFamily: "Geist, sans-serif" }}>
          Lead Pipeline
        </h1>
        <p className="text-[#a1a1aa] text-sm max-w-2xl" style={{ fontFamily: "Geist, sans-serif" }}>
          Select a recent broadcast to review AI debriefs and manage identified high-value prospects.
        </p>
      </div>

      {!success || !webinars || webinars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">No broadcast data available</p>
          <p className="text-xs text-zinc-600 mt-2">Start your first webinar to see AI-generated insights here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {webinars.map((webinar) => (
            <div
              key={webinar.id}
              className="group bg-[#141313] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col h-full relative"
            >
              {/* Card Header */}
              <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white leading-tight group-hover:text-white/90 transition-colors" style={{ fontFamily: "Geist, sans-serif" }}>
                      {webinar.title}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      {new Date(webinar.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  {webinar.status === WebinarStatusEnum.LIVE ? (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-red-500 uppercase">LIVE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                      <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">VOD</span>
                    </div>
                  )}
                </div>

                {/* Main Stats Row */}
                <div className="flex items-baseline gap-8 my-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Attendees</span>
                    <p className="text-2xl font-semibold text-white tracking-tight">{webinar.totalAttendees.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Hot Leads</span>
                      <div className="w-1 h-1 rounded-full bg-amber-500" />
                    </div>
                    <p className="text-2xl font-semibold text-white tracking-tight">{webinar.hotLeads}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pipeline</span>
                    <p className="text-2xl font-semibold text-white tracking-tight">
                      {formatCurrency(webinar.pipelineValue)}
                    </p>
                  </div>
                </div>

                {/* AI Summary Snippet */}
                <div className="relative overflow-hidden pt-4 border-t border-zinc-900">
                  <p className="text-xs leading-relaxed text-zinc-400 line-clamp-4 min-h-[5rem]" style={{ fontFamily: "Geist, sans-serif" }}>
                    {webinar.summary}
                  </p>
                  {/* Subtle fade effect for summary overflow */}
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
