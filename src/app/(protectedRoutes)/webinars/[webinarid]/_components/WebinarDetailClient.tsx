"use client";

import { useState } from "react";
import { LayoutDashboard, Users } from "lucide-react";
import { AttendedTypeEnum } from "@/generated/prisma/enums";
import { getWebinarById } from "@/actions/webinar";
import { getWebinarAttendence } from "@/actions/attendence";
import WebinarDetailHeader from "./WebinarDetailHeader";
import WebinarStatusControls from "./WebinarStatusControls";
import WebinarOverviewTab from "./WebinarOverviewTab";
import PipelineLayout from "../pipeline/_components/PipelineLayout";

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

export default function WebinarDetailClient({
  webinar,
  pipelineData,
}: {
  webinar: WebinarData;
  pipelineData: PipelineData;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline">(
    "overview"
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header section */}
      <div className="w-full flex flex-col gap-6 p-6 rounded-lg border border-[#27272a] bg-[#18181b]">
        <WebinarDetailHeader
          title={webinar.title}
          description={webinar.description}
          startTime={webinar.startTime}
          webinarStatus={webinar.webinarStatus}
          presenterName={webinar.presenter.name}
          webinarId={webinar.id}
        />

        {/* Action controls */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[#27272a]">
          <p className="text-xs text-[#71717a]">
            Manage your webinar status and share the attendee link above
          </p>
          <WebinarStatusControls
            webinarId={webinar.id}
            currentStatus={webinar.webinarStatus}
          />
        </div>
      </div>

      {/* Tabs section */}
      <div className="w-full flex flex-col">
        {/* Tab triggers */}
        <div className="flex items-center gap-2 border-b border-[#27272a] mb-5 pb-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "overview"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-[#71717a] hover:text-[#fafafa]"
              }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "pipeline"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-[#71717a] hover:text-[#fafafa]"
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            Pipeline
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <WebinarOverviewTab
            description={webinar.description}
            tags={webinar.tags}
            ctaType={webinar.ctaType}
            ctaLabel={webinar.ctaLabel}
            aiAgentId={webinar.aiAgentId}
            couponEnabled={webinar.couponEnabled}
            couponCode={webinar.couponCode}
            lockChat={webinar.lockChat}
            webinarStatus={webinar.webinarStatus}
          />
        )}

        {activeTab === "pipeline" && (
          <>
            {pipelineData.data ? (
              <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
                {Object.entries(pipelineData.data).map(
                  ([columnType, columnData]) => (
                    <PipelineLayout
                      key={columnType}
                      title={formatColumnTitle(columnType as AttendedTypeEnum)}
                      count={columnData.count}
                      users={columnData.users}
                      tags={pipelineData.webinarTags}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-[#71717a] text-base">
                No pipeline data yet. Share your webinar link to get registrations!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
