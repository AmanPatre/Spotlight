"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Search, ChevronRight } from "lucide-react";
import { LightningIcon } from "@/icons/LightningIcon";
import { User } from "@prisma/client";
import CreateWebinarButton from "../CreateWebinarButton";

const routeLabel: Record<string, string> = {
  home: "Dashboard",
  webinars: "Webinars",
  lead: "Sales Pipeline",
  "ai-agents": "AI Agents",
  settings: "Settings",
  billing: "Billing",
};

const Header = () => {
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
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#52525b]" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 h-9 text-sm bg-[#111113] border border-[#27272a] rounded-full text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-white focus:border-white w-64 transition-all"
          />
        </div>

        {/* Notifications bell */}
        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-[#111113] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors">
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* AI lightning icon */}
        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-black hover:bg-[#e4e4e7] transition-colors">
          <LightningIcon className="w-3.5 h-3.5" />
        </button>

        {/* Create webinar */}
        <CreateWebinarButton />
      </div>
    </header>
  );
};

export default Header;
