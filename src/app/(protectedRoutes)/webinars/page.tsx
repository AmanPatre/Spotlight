import { onAuthenticateUser } from "@/actions/auth";
import PageHeader from "@/components/ui/ReusableComponent/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadIcon } from "@/icons/LeadIcon";
import { Webcam, HomeIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { getWebinarByPresenterId } from "@/actions/webinar";
import WebinarCard from "./_components/WebinarCard";
import { Webinar } from "@/generated/prisma/client";

type Props = {};

const Page = async (props: Props) => {
  const checkUser = await onAuthenticateUser();

  if (!checkUser.user) {
    redirect("/");
  }

  const webinars = await getWebinarByPresenterId(checkUser?.user?.id);

  return (
    <Tabs defaultValue="all" className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<HomeIcon className="w-3 h-3" />}
        mainIcon={<Webcam className="w-12 h-12" />}
        rightIcon={<LeadIcon className="w-4 h-4" />}
        heading="The home to all your webinars"
        placeholder="Search option..."
      >
        <TabsList className="bg-transparent space-x-2">
          <TabsTrigger
            value="all"
            className="bg-[#18181b] border border-[#27272a] text-[#a1a1aa] data-[state=active]:bg-violet-600/10 data-[state=active]:border-violet-500/40 data-[state=active]:text-violet-400 px-5 py-2 rounded-md text-sm"
          >
            All
          </TabsTrigger>

          <TabsTrigger
            value="upcoming"
            className="bg-[#18181b] border border-[#27272a] text-[#a1a1aa] data-[state=active]:bg-violet-600/10 data-[state=active]:border-violet-500/40 data-[state=active]:text-violet-400 px-5 py-2 rounded-md text-sm"
          >
            Upcoming
          </TabsTrigger>

          <TabsTrigger
            value="live"
            className="bg-[#18181b] border border-[#27272a] text-[#a1a1aa] data-[state=active]:bg-emerald-600/10 data-[state=active]:border-emerald-500/40 data-[state=active]:text-emerald-400 px-5 py-2 rounded-md text-sm"
          >
            Live
          </TabsTrigger>

          <TabsTrigger
            value="ended"
            className="bg-[#18181b] border border-[#27272a] text-[#a1a1aa] data-[state=active]:bg-violet-600/10 data-[state=active]:border-violet-500/40 data-[state=active]:text-violet-400 px-5 py-2 rounded-md text-sm"
          >
            Ended
          </TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent
        value="all"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebinarCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No Webinar found
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="upcoming"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.filter(w => w.webinarStatus === 'SCHEDULED' || w.webinarStatus === 'WAITING_ROOM').length > 0 ? (
          webinars
            .filter(w => w.webinarStatus === 'SCHEDULED' || w.webinarStatus === 'WAITING_ROOM')
            .map((webinar: Webinar, index: number) => (
              <WebinarCard key={index} webinar={webinar} />
            ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12 text-center">
            No upcoming webinars
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="live"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.filter(w => w.webinarStatus === 'LIVE').length > 0 ? (
          webinars
            .filter(w => w.webinarStatus === 'LIVE')
            .map((webinar: Webinar, index: number) => (
              <WebinarCard key={index} webinar={webinar} />
            ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12 text-center">
            You are not live right now
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="ended"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.filter(w => w.webinarStatus === 'ENDED').length > 0 ? (
          webinars
            .filter(w => w.webinarStatus === 'ENDED')
            .map((webinar: Webinar, index: number) => (
              <WebinarCard key={index} webinar={webinar} />
            ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12 text-center">
            No ended webinars
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default Page;
