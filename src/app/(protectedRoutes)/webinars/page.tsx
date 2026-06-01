import { onAuthenticateUser } from "@/actions/auth";
import { ChevronRight, Plus, Video } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { getWebinarByPresenterId } from "@/actions/webinar";
import WebinarTabs from "./_components/WebinarTabs";
import CreateWebinarButton from "@/components/ui/ReusableComponent/CreateWebinarButton";
import { Suspense } from "react";
import WebinarFilterButton from "./_components/WebinarFilterButton";

const Page = async () => {
  const checkUser = await onAuthenticateUser();

  if (!checkUser.user) {
    redirect("/");
  }

  const webinars = await getWebinarByPresenterId(checkUser?.user?.id);

  return (
    <div className="w-full">
      {/* Top Header Bar */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-[#2e2e2e] bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
          <span className="hover:text-white cursor-pointer transition-colors">Spotlight</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">Webinars</span>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="w-8 h-8 rounded-md border border-[#2e2e2e] bg-[#1c1b1b] animate-pulse"></div>}>
            <WebinarFilterButton />
          </Suspense>
          <CreateWebinarButton className="bg-white text-black px-4 py-1.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Webinar
          </CreateWebinarButton>
        </div>
      </header>

      {/* Page Body */}
      <div className="px-8 py-8 space-y-8">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#2b2a2a] border border-[#2e2e2e] flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            The home to all your webinars
          </h1>
        </div>

        {/* Tabs + Grid — client component to avoid base-ui flex conflict */}
        <WebinarTabs webinars={webinars ?? []} />
      </div>
    </div>
  );
};

export default Page;
