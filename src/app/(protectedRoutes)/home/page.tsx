import React from "react";
import { BarChart3, Users, Mic, TrendingUp, Plus, ArrowRight, Webcam, Zap } from "lucide-react";
import Link from "next/link";
import OnBoarding from "./_components/OnBoarding";
import { potentialCustomer } from "@/lib/data";
import UserInfoCard from "@/components/ui/ReusableComponent/UserInfocard";

const statCards = [
  { label: "Total Webinars", value: "12", icon: Webcam, change: "+3 this month", positive: true },
  { label: "Total Leads", value: "248", icon: Users, change: "+42 this week", positive: true },
  { label: "Active AI Agents", value: "5", icon: Mic, change: "2 in session", positive: true },
  { label: "Conversion Rate", value: "18%", icon: TrendingUp, change: "+2.4% vs last month", positive: true },
];

const quickActions = [
  { label: "Create Webinar", href: "/webinars", icon: Plus, primary: true },
  { label: "View Pipeline", href: "/lead", icon: BarChart3, primary: false },
  { label: "Manage AI Agents", href: "/ai-agents", icon: Zap, primary: false },
];

const Pages = () => {
  return (
    <div className="w-full mx-auto h-full space-y-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Dashboard</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your webinars.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${a.primary
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
                }`}
            >
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-lg border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#71717a] font-medium uppercase tracking-wide">{s.label}</span>
              <div className="w-7 h-7 rounded-md bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <s.icon className="w-3.5 h-3.5 text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#fafafa]">{s.value}</p>
            <p className="text-xs text-[#a1a1aa] mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Onboarding + sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding steps */}
        <div className="lg:col-span-1 p-5 rounded-lg border border-[#27272a] bg-[#18181b]">
          <h2 className="text-sm font-medium text-[#fafafa] mb-4">Getting Started</h2>
          <OnBoarding />
        </div>

        {/* Potential customers preview */}
        <div className="lg:col-span-2 p-5 rounded-lg border border-[#27272a] bg-[#18181b]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#fafafa]">Recent Leads</h2>
            <Link
              href="/lead"
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {potentialCustomer.slice(0, 3).map((customer, index) => (
              <UserInfoCard customer={customer} tags={customer.tags} key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Feature section links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/lead"
          className="group p-5 rounded-lg border border-[#27272a] bg-[#18181b] hover:border-violet-500/40 hover:bg-[#1c1c1f] transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#fafafa]">Sales Pipeline</span>
            <ArrowRight className="w-4 h-4 text-[#52525b] group-hover:text-violet-400 transition-colors" />
          </div>
          <p className="text-xs text-[#71717a]">
            Track attendees from registered → attending → converted
          </p>
        </Link>

        <Link
          href="/webinars"
          className="group p-5 rounded-lg border border-[#27272a] bg-[#18181b] hover:border-violet-500/40 hover:bg-[#1c1c1f] transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#fafafa]">My Webinars</span>
            <ArrowRight className="w-4 h-4 text-[#52525b] group-hover:text-violet-400 transition-colors" />
          </div>
          <p className="text-xs text-[#71717a]">
            Manage live, upcoming, and archived webinar sessions
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Pages;
