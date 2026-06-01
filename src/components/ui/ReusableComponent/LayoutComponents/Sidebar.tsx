"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Activity, Home, Video, Users, CreditCard, Settings, Plus, Cpu } from "lucide-react";
import CreateWebinarButton from "../CreateWebinarButton";

const sidebarData = [
  { id: 1, title: "Home", link: "/home", icon: Home },
  { id: 2, title: "Webinars", link: "/webinars", icon: Video },
  { id: 3, title: "AI Agents", link: "/ai-agents", icon: Cpu },
  { id: 4, title: "Leads", link: "/lead", icon: Users },
  { id: 5, title: "Billing", link: "/billing", icon: CreditCard },
  { id: 6, title: "Settings", link: "/settings", icon: Settings },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-[240px] flex flex-col py-6 border-r border-[#444748] z-50">
      {/* Brand / Header */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#ffffff] flex items-center justify-center">
          <Activity className="text-[#2f3131] w-[18px] h-[18px] stroke-[2.5]" />
        </div>
        <div>
          <div className="text-[20px] leading-[1.4] text-[#ffffff] font-bold">Spotlight</div>
          <div className="text-[12px] font-medium leading-[1] text-[#c4c7c8] mt-1">Enterprise Console</div>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 flex flex-col gap-1 w-full text-[14px]">
        {sidebarData.map((item) => {
          const isActive = pathname.startsWith(item.link);
          return (
            <li key={item.id}>
              <Link
                href={item.link}
                className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors duration-200 ${isActive
                  ? "text-[#ffffff] bg-[#45464e] border-[#ffffff]"
                  : "border-transparent text-[#b4b4bd] hover:bg-[#353434] hover:text-[#ffffff]"
                  }`}
              >
                <item.icon className="w-[20px] h-[20px]" />
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* CTA */}
      <div className="flex flex-col gap-4 px-6 mt-auto">
        <div className="flex items-center justify-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
        <CreateWebinarButton className="w-full justify-center">
          <Plus className="w-3.5 h-3.5" />
          New Webinar
        </CreateWebinarButton>
      </div>
    </nav>
  );
};

export default Sidebar;
