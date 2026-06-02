import { getWebinarLeadsDetail } from "@/actions/attendence";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import React from "react";
import { formatCurrency } from "@/lib/utils";
import PipelineValueToggle from "./_components/PipelineValueToggle";

export const dynamic = 'force-dynamic';

interface Lead {
    id: string;
    user: { name: string; email: string };
    CallDebrief?: { score?: number | null; summary?: string | null } | null;
    attendedType: string;
}

type Props = {
    params: Promise<{ webinarid: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
    const { webinarid } = await params;
    const { success, webinar, leads: rawLeads } = await getWebinarLeadsDetail(webinarid);

    if (!success || !webinar || !rawLeads) {
        notFound();
    }

    const leads = rawLeads as Lead[];

    const convertedLeads = leads.filter(l => l.attendedType === "CONVERTED");

    // Hot leads: score >= 8 AND not yet converted
    const hotLeads = leads.filter(l =>
        l.attendedType !== "CONVERTED" &&
        (l.CallDebrief?.score || 0) >= 8
    );

    // Since hotLeads already excludes converted, all hot leads are unconverted
    const unconvertedHotLeadsCount = hotLeads.length;

    const standardLeads = leads.filter(l =>
        l.attendedType !== "CONVERTED" &&
        !((l.CallDebrief?.score || 0) >= 8)
    );

    const price = webinar.price || 0;
    const currency = webinar.currency || "INR";

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* Top Nav / Breadcrumb */}
            <Link
                href="/lead"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Back to All Webinars</span>
            </Link>

            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-semibold tracking-tight text-white max-w-2xl" style={{ fontFamily: "Geist, sans-serif" }}>
                        {webinar.title}
                    </h1>
                    <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                        <span>{new Date(webinar.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-zinc-400">{webinar.tags?.[0] || "Webinar Series"}</span>
                    </div>
                </div>

                {/* Highlight Stats via Client Toggle */}
                <PipelineValueToggle
                    convertedCount={convertedLeads.length}
                    hotLeadsCount={hotLeads.length}
                    unconvertedHotLeadsCount={unconvertedHotLeadsCount}
                    totalAttendeesCount={leads.length}
                    price={price}
                    currency={currency}
                />
            </div>

            <div className="space-y-16 pt-6">
                {/* Converted Section */}
                <LeadSection
                    title="Converted (Closed Deals)"
                    leads={convertedLeads}
                    price={price}
                    isConverted
                />

                {/* Hot Leads Section */}
                <LeadSection
                    title="Hot Leads (Score 8-10)"
                    leads={hotLeads}
                    price={price}
                    isHot
                />

                {/* Standard Leads Section */}
                <LeadSection
                    title="Standard Leads (Score 1-7)"
                    leads={standardLeads}
                    price={price}
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, highlighted = false }: { label: string, value: string | number, highlighted?: boolean }) {
    return (
        <div className="bg-[#141313] border border-zinc-800 p-6 min-w-[160px] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">{label}</span>
            <p className={`text-2xl font-semibold tracking-tight ${highlighted ? 'text-white' : 'text-zinc-300'}`}>
                {value}
            </p>
        </div>
    );
}

function LeadSection({ title, leads, price, isHot = false, isConverted = false }: { title: string, leads: { id: string; user: { name: string, email: string }; CallDebrief?: { score?: number | null; summary?: string | null } | null; attendedType: string }[], price: number, isHot?: boolean, isConverted?: boolean }) {
    if (leads.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConverted ? 'bg-emerald-500' : isHot ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`} />
                <h2 className="font-mono text-[11px] text-white uppercase tracking-widest">{title}</h2>
            </div>

            <div className="border border-zinc-800 overflow-hidden bg-[#0c0c0c]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-[#141313]">
                            <TableHead label="Contact" />
                            <TableHead label="Email" />
                            <TableHead label="Score" className="text-center" />
                            <TableHead label="Est. Value" />
                            <TableHead label="AI Summary" />
                            <TableHead label="Action" className="text-right" />
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                className="group border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors"
                            >
                                <TableCell className="font-medium text-white">
                                    {lead.user.name}
                                </TableCell>
                                <TableCell className="text-zinc-500 truncate max-w-[200px]">
                                    {lead.user.email}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className={`inline-flex items-center justify-center w-10 h-10 border ${isHot ? 'border-zinc-700 text-white font-bold bg-white/5' : 'border-zinc-800 text-zinc-500'} font-mono text-sm`}>
                                        {lead.CallDebrief?.score || "—"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-400 font-mono text-[13px]">
                                    {formatCurrency(isConverted ? price : isHot ? (price * 0.7) : (price * 0.1))}
                                </TableCell>
                                <TableCell className="text-zinc-400 max-w-md text-[13px] leading-relaxed py-4">
                                    {lead.CallDebrief?.summary || "Attended main broadcast. Interaction data pending AI synthesis."}
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="text-zinc-600 group-hover:text-white transition-colors">
                                        <ChevronRight className="w-5 h-5 ml-auto" />
                                    </button>
                                </TableCell>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TableHead({ label, className = "" }: { label: string, className?: string }) {
    return (
        <th className={`px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest ${className}`}>
            {label}
        </th>
    );
}

function TableCell({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <td className={`px-6 py-4 text-sm ${className}`}>
            {children}
        </td>
    );
}
