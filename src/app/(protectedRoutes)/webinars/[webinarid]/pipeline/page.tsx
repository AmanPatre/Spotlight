import { getWebinarAttendence } from "@/actions/attendence";
import { getWebinarDebriefs } from "@/actions/debrief";
import PageHeader from "@/components/ui/ReusableComponent/PageHeader";
import { AttendedTypeEnum } from "@/generated/prisma/enums";
import { HomeIcon } from "@/icons/HomeIcon";
import { LeadIcon } from "@/icons/LeadIcon";
import { PipelineIcon } from "@/icons/PipelineIcon";
import PipelineLayout from "./_components/PipelineLayout";
import DebriefWidget from "./_components/DebriefWidget";

export const dynamic = "force-dynamic";

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


type Props = {
  params: Promise<{
    webinarid: string;
  }>;
};

const page = async ({ params }: Props) => {
  const { webinarid: webinarId } = await params;

  // Fetch both pipeline data AND AI debriefs in parallel
  const [pipelineData, debriefData] = await Promise.all([
    getWebinarAttendence(webinarId),
    getWebinarDebriefs(webinarId),
  ]);

  if (!pipelineData.data) {
    return (
      <div className="text-3xl h-[400px] flex justify-center items-center">
        No Pipelines Found
      </div>
    );
  }

  // Calculate total attendees for the widget
  const totalAttendeesCount = pipelineData.data[AttendedTypeEnum.REGISTERED]?.count ?? 0;

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<LeadIcon className="w-4 h-4" />}
        mainIcon={<PipelineIcon className="w-12 h-12" />}
        rightIcon={<HomeIcon className="w-3 h-3" />}
        heading="Keep track of all of your customers"
        placeholder="Search Name, Tag or Email"
      />

      {/* AI Debrief Widget — only visible when there are AI results */}
      {debriefData.success && debriefData.debriefs && debriefData.debriefs.length > 0 && (
        <DebriefWidget
          debriefs={debriefData.debriefs}
          totalAttendeesCount={totalAttendeesCount}
          price={(pipelineData as unknown as { price: number }).price || 0}
          currency={(pipelineData as unknown as { currency: string }).currency || "INR"}
        />
      )}

      <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
        {Object.entries(pipelineData.data).map(([columnType, columnData]) => (
          <PipelineLayout
            key={columnType}
            title={formatColumnTitle(columnType as AttendedTypeEnum)}
            count={columnData.count}
            users={columnData.users}
            tags={pipelineData.webinarTags}
            debriefs={debriefData.debriefs || []}
          />
        ))}
      </div>
    </div>
  );
};

export default page;

