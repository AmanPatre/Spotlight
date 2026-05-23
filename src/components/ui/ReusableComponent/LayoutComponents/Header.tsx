"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Search, ChevronRight } from "lucide-react";
import { LightningIcon } from "@/icons/LightningIcon";
import { User } from "../../../../generated/prisma/browser";
import CreateWebinarButton from "../CreateWebinarButton";

type Props = {
  user: User;
};

const routeLabel: Record<string, string> = {
  home: "Dashboard",
  webinars: "Webinars",
  lead: "Sales Pipeline",
  "ai-agents": "AI Agents",
  settings: "Settings",
  billing: "Billing",
};

const Header = ({ user }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);
  const currentLabel = routeLabel[segments[0]] ?? segments[0] ?? "Dashboard";

  return (
    <header className="w-full px-6 py-4 sticky top-0 z-10 flex justify-between items-center gap-4 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {pathname.includes("pipeline") ? (
          <Button
            variant="outline"
            size="sm"
            className="bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white h-8"
            onClick={() => router.push("/webinars")}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Webinars
          </Button>
        ) : (
          <>
            <span className="text-[#a1a1aa]">Spotlight</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#52525b]" />
            <span className="text-[#fafafa] font-medium">{currentLabel}</span>
          </>
        )}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#52525b]" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 h-8 text-sm bg-[#18181b] border border-[#27272a] rounded-md text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] w-48 transition-all"
          />
        </div>

        {/* Notifications bell */}
        <button className="flex items-center justify-center w-8 h-8 rounded-md bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors">
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* AI lightning icon */}
        <button className="flex items-center justify-center w-8 h-8 rounded-md bg-[#ffffff] border border-[#27272a] text-[#141313] hover:bg-[#c6c6c7] transition-colors">
          <LightningIcon />
        </button>

        {/* Create webinar */}
        <CreateWebinarButton />
      </div>
    </header>
  );
};

export default Header;
