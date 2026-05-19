"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { SpotlightIcon } from "@/icons/Spotlight";
import { sidebarData } from "@/lib/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="w-16 h-screen sticky top-0 flex flex-col items-center justify-between py-5 px-2 border-r border-[#27272a] bg-[#09090b] z-20 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20">
        <SpotlightIcon />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-2 flex-1 mt-8">
        {sidebarData.map((item) => {
          const isActive = pathname.startsWith(item.link);
          return (
            <TooltipProvider key={item.id} delay={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={item.link}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150
                      ${isActive
                        ? "iconBackground text-white"
                        : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* User avatar */}
      <div className="flex items-center justify-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
