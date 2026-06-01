import { getWebinarLeadsOverview } from "@/actions/attendence";
import { WebinarStatusEnum } from "@prisma/client";
import React from "react";
import LeadPageClient from "./_components/LeadPageClient";

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
        <LeadPageClient
          webinars={webinars.map(w => ({
            id: w.id,
            title: w.title,
            status: w.status,
            date: new Date(w.date),
            totalAttendees: w.totalAttendees,
            convertedCount: w.convertedCount,
            summary: w.summary,
            pipelineValue: w.pipelineValue
          }))}
        />
      )}
    </div>
  );
}
