import { getWebinarAttendence } from "@/actions/attendence";
import { getWebinarDebriefs } from "@/actions/debrief";
import PageHeader from "@/components/ui/ReusableComponent/PageHeader";
import { AttendedTypeEnum } from "@prisma/client";
import { HomeIcon } from "@/icons/HomeIcon";
import { LeadIcon } from "@/icons/LeadIcon";
import { PipelineIcon } from "@/icons/PipelineIcon";
import PipelineLayout from "./_components/PipelineLayout";
import PipelineSearch from "./_components/PipelineSearch";
import DebriefWidget from "./_components/DebriefWidget";
import { Attendee } from "@prisma/client";

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
  searchParams: Promise<{ q?: string }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { webinarid: webinarId } = await params;
  const { q: search } = await searchParams;

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

  // Apply search filtering if a query exists
  const filteredData = { ...pipelineData.data };
  if (search) {
    const query = search.toLowerCase();
    Object.keys(filteredData).forEach((key) => {
      const column = filteredData[key as AttendedTypeEnum];
      const filteredUsers = column.users.filter(
        (user: Attendee) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
      filteredData[key as AttendedTypeEnum] = {
        ...column,
        users: filteredUsers,
        count: filteredUsers.length,
      };
    });
  }

  // Calculate total attendees for the widget
  const totalAttendeesCount = pipelineData.data[AttendedTypeEnum.REGISTERED]?.count ?? 0;
  const convertedCount = filteredData[AttendedTypeEnum.CONVERTED]?.count ?? 0;

  // Identify which hot leads are NOT converted
  const unconvertedHotLeadsCount = (debriefData.debriefs || []).filter(d => {
    const isHot = (d.score || 0) >= 8;
    if (!isHot) return false;

    // Check if this attendee is in the CONVERTED column
    const isConverted = filteredData[AttendedTypeEnum.CONVERTED]?.users.some(u => u.id === d.attendance.attendeeId);
    return !isConverted;
  }).length;

  return (
    <div className="w-full flex flex-col gap-4">
      <PageHeader
        leftIcon={<LeadIcon className="w-4 h-4" />}
        mainIcon={<PipelineIcon className="w-12 h-12" />}
        rightIcon={<HomeIcon className="w-3 h-3" />}
        heading="Keep track of all of your customers"
        showSearch={false}
      >
        <PipelineSearch placeholder="Search Name or Email" />
      </PageHeader>

      {/* AI Debrief Widget — only visible when there are AI results */}
      {debriefData.success && debriefData.debriefs && debriefData.debriefs.length > 0 && (
        <DebriefWidget
          debriefs={debriefData.debriefs}
          totalAttendeesCount={totalAttendeesCount}
          price={(pipelineData as any).price || 0}
          currency={(pipelineData as any).currency || "INR"}
          convertedCount={convertedCount}
          unconvertedHotLeadsCount={unconvertedHotLeadsCount}
        />
      )}

      <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
        {Object.entries(filteredData).map(([columnType, columnData]) => (
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

