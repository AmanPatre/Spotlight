"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  LinkIcon,
  LayoutDashboard,
  Kanban,
  FileText,
  Tag,
  Pointer,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { AttendedTypeEnum, WebinarStatusEnum, CtaTypeEnum } from "@prisma/client";
import { getWebinarById } from "@/actions/webinar";
import { getWebinarAttendence } from "@/actions/attendence";
import WebinarStatusControls from "./WebinarStatusControls";
import PipelineLayout from "../pipeline/_components/PipelineLayout";
import { toast } from "sonner";
import Link from "next/link";

type WebinarData = NonNullable<Awaited<ReturnType<typeof getWebinarById>>>;
type PipelineData = Awaited<ReturnType<typeof getWebinarAttendence>>;

const formatColumnTitle = (type: AttendedTypeEnum): string => {
  const titles: Record<AttendedTypeEnum, string> = {
    [AttendedTypeEnum.REGISTERED]: "Registered",
    [AttendedTypeEnum.ATTENDED]: "Attended",
    [AttendedTypeEnum.ADDED_TO_CART]: "Added to Cart",
    [AttendedTypeEnum.FOLLOW_UP]: "Follow Up",
    [AttendedTypeEnum.BREAKOUT_ROOM]: "Booked a Call",
    [AttendedTypeEnum.CONVERTED]: "Converted",
  };
  return titles[type] ?? type;
};

const statusConfig: Record<WebinarStatusEnum, { label: string; color: string }> = {
  [WebinarStatusEnum.SCHEDULED]: {
    label: "Scheduled",
    color: "bg-[#18181b] border-[#27272a] text-[#c4c7c8]",
  },
  [WebinarStatusEnum.WAITING_ROOM]: {
    label: "Waiting Room",
    color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  [WebinarStatusEnum.LIVE]: {
    label: "Live",
    color: "bg-red-500/10 border-red-500/20 text-red-400",
  },
  [WebinarStatusEnum.ENDED]: {
    label: "Ended",
    color: "bg-[#18181b] border-[#27272a] text-[#c4c7c8]",
  },
  [WebinarStatusEnum.CANCELLED]: {
    label: "Cancelled",
    color: "bg-[#18181b] border-[#27272a] text-[#c4c7c8]",
  },
};

export default function WebinarDetailClient({
  webinar,
  pipelineData,
}: {
  webinar: WebinarData;
  pipelineData: PipelineData;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline">("overview");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const attendeeLink = `${baseUrl}/webinar/${webinar.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(attendeeLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Polling for fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex-1 p-4 md:p-10 max-w-[1440px] mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <Link
          href="/webinars"
          className="text-[#c4c7c8] hover:text-white flex items-center gap-2 text-xs font-medium transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Webinars
        </Link>
      </div>

      {/* Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[32px] md:text-4xl font-semibold text-white tracking-tight">
                {webinar.title}
              </h2>
              <span className={`px-2 py-1 border text-[10px] font-medium rounded uppercase tracking-wider ${statusConfig[webinar.webinarStatus].color}`}>
                {statusConfig[webinar.webinarStatus].label}
              </span>
            </div>
            <p className="text-[#c4c7c8] mb-4">
              Hosted by <span className="text-white">{webinar.presenter.name}</span>
            </p>
            <div className="flex flex-wrap items-center gap-6 text-[#c4c7c8] text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5" />
                {format(new Date(webinar.startTime), "EEEE, MMMM do yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5" />
                {format(new Date(webinar.startTime), "hh:mm a")}
              </div>
            </div>
          </div>
        </div>

        {/* Link Management */}
        <div className="mt-8 p-4 bg-[#09090b] border border-[#27272a] rounded flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[#c4c7c8] w-full truncate">
            <LinkIcon className="w-4 h-4 shrink-0" />
            <code className="text-[13px] font-mono truncate text-[#e5e2e1]">
              {attendeeLink}
            </code>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 bg-transparent border border-[#27272a] text-white hover:bg-[#18181b] px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Status Footer */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-[#27272a] pt-4 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-[#c4c7c8] text-sm text-center sm:text-left">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Live Syncing
            </span>
            <span className="hidden sm:inline text-xs opacity-50">|</span>
            <span>Manage your webinar status and share the attendee link above</span>
          </div>
          <WebinarStatusControls
            webinarId={webinar.id}
            currentStatus={webinar.webinarStatus}
          />
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-[#27272a] mb-8 flex gap-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-all ${activeTab === "overview"
            ? "border-white text-white"
            : "border-transparent text-[#c4c7c8] hover:text-white"
            }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`pb-3 border-b-2 text-sm font-medium flex items-center gap-2 transition-all ${activeTab === "pipeline"
            ? "border-white text-white"
            : "border-transparent text-[#c4c7c8] hover:text-white"
            }`}
        >
          <Kanban className="w-4.5 h-4.5" />
          Pipeline
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description Card */}
          <div className="bg-[#09090b] border border-[#27272a] rounded p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-white" />
              <h3 className="text-sm font-medium text-white">Description</h3>
            </div>
            <div className="flex-grow flex items-center">
              <p className="text-[#c4c7c8] text-sm leading-relaxed">
                {webinar.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-[#09090b] border border-[#27272a] rounded p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-white" />
              <h3 className="text-sm font-medium text-white">Tags</h3>
            </div>
            <div className="flex-grow flex flex-wrap items-center justify-center gap-2 border border-dashed border-[#27272a] rounded bg-[#18181b]/50 min-h-[100px] p-4">
              {webinar.tags && webinar.tags.length > 0 ? (
                webinar.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 text-white border border-white/10 text-[11px] font-medium">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-[#c4c7c8] text-sm italic">No tags added.</p>
              )}
            </div>
          </div>

          {/* Call to Action Card */}
          <div className="bg-[#09090b] border border-[#27272a] rounded p-6">
            <div className="flex items-center gap-2 mb-6">
              <Pointer className="w-5 h-5 text-white" />
              <h3 className="text-sm font-medium text-white">Call to Action</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <span className="text-[#c4c7c8] text-[11px] uppercase tracking-wider">Type</span>
                <span className="bg-[#18181b] border border-[#27272a] text-white px-3 py-1 rounded text-xs">
                  {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL ? "Book a Call" : "Buy Now"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <span className="text-[#c4c7c8] text-[11px] uppercase tracking-wider">Label</span>
                <span className="text-white text-sm">{webinar.ctaLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c4c7c8] text-[11px] uppercase tracking-wider">AI Agent</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-white border border-[#27272a]">
                    {webinar.aiAgentName?.[0] || webinar.presenter.name[0]}
                  </div>
                  <span className="text-white text-sm">
                    {webinar.aiAgentName || (webinar.aiAgentId ? "Configured" : "None")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-[#09090b] border border-[#27272a] rounded p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-white" />
              <h3 className="text-sm font-medium text-white">Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center gap-2 text-[#c4c7c8]">
                  <span className="text-[11px] uppercase tracking-wider">Chat</span>
                </div>
                <span className="text-white text-sm">
                  {webinar.lockChat ? "Locked (host only)" : "Open to all"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center gap-2 text-[#c4c7c8]">
                  <span className="text-[11px] uppercase tracking-wider">Coupon</span>
                </div>
                <span className="text-[#c4c7c8] text-sm">
                  {webinar.couponEnabled ? webinar.couponCode : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#c4c7c8]">
                  <span className="text-[11px] uppercase tracking-wider">Status</span>
                </div>
                <span className="text-white text-sm flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${webinar.webinarStatus === WebinarStatusEnum.LIVE ? 'bg-red-500 animate-pulse' : 'bg-white'}`}></span>
                  {statusConfig[webinar.webinarStatus].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="w-full">
          {pipelineData.data ? (
            <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
              {Object.entries(pipelineData.data).map(([columnType, columnData]) => (
                <PipelineLayout
                  key={columnType}
                  title={formatColumnTitle(columnType as AttendedTypeEnum)}
                  count={columnData.count}
                  users={columnData.users}
                  tags={pipelineData.webinarTags}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center text-[#c4c7c8] text-base">
              No pipeline data yet. Share your webinar link to get registrations!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
