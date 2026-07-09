import React from "react";
import { Activity, ArrowRight, Calendar, TrendingUp, DollarSign, Mic, Download } from "lucide-react";
import { getHomeDashboardData } from "@/actions/dashboard";

export const dynamic = 'force-dynamic';

const Pages = async () => {
  const { success, data } = await getHomeDashboardData();

  if (!success || !data) {
    return (
      <div className="w-full h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-4 bg-black">
        <div className="w-10 h-10 border border-[#ffb4ab] flex items-center justify-center">
          <span className="text-[#ffb4ab] font-mono text-xl">!</span>
        </div>
        <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">Failed to load dashboard metrics</p>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-10">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-[#444748] pb-6 gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.2] font-semibold text-[#ffffff] tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>Overview</h1>
          <p className="text-[14px] text-[#c4c7c8] mt-2 max-w-lg" style={{ fontFamily: "Geist, sans-serif" }}>
            Real-time performance metrics and stream scheduling. Monitor aggregate attendee data across active enterprise deployments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[12px] font-medium text-[#c4c7c8] border border-[#444748] rounded px-3 py-1.5 bg-[#1c1b1b] flex items-center gap-2 font-mono">
            <Calendar className="w-[14px] h-[14px]" />
            LIVE_MONITOR
          </div>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Metric 1 */}
        <div className="bg-[#1c1b1b] border border-[#444748] p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-[14px] font-medium text-[#e5e2e1]" style={{ fontFamily: "Geist, sans-serif" }}>Total Attendees</h2>
            <Activity className="w-[20px] h-[20px] text-[#c4c7c8]" />
          </div>
          <div>
            <div className="text-[48px] leading-[1.1] font-semibold text-[#ffffff] tracking-tight">
              {data.metrics.totalAttendees.toLocaleString()}
            </div>
            <div className="text-[12px] font-medium text-[#c4c7c8] mt-3 flex items-center gap-1 font-mono uppercase tracking-wider">
              <Activity className="w-[14px] h-[14px] text-emerald-500" />
              Live Sync Active
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#1c1b1b] border border-[#444748] p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-[14px] font-medium text-[#e5e2e1]" style={{ fontFamily: "Geist, sans-serif" }}>Active Agents</h2>
            <Mic className="w-[20px] h-[20px] text-[#c4c7c8]" />
          </div>
          <div>
            <div className="text-[48px] leading-[1.1] font-semibold text-[#ffffff] tracking-tight">
              {data.metrics.activeAgents}
            </div>
            <div className="text-[12px] font-medium text-[#c4c7c8] mt-3 flex items-center gap-1 font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Vapi System Online
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#1c1b1b] border border-[#444748] p-6 rounded-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#e2e2e2]/5 blur-3xl rounded-full"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h2 className="text-[14px] font-medium text-[#e5e2e1]" style={{ fontFamily: "Geist, sans-serif" }}>Pipeline Value</h2>
            <DollarSign className="w-[20px] h-[20px] text-[#c4c7c8]" />
          </div>
          <div className="relative z-10">
            <div className="text-[48px] leading-[1.1] font-semibold text-[#ffffff] tracking-tight">
              {data.metrics.pipelineValue}
            </div>
            <div className="text-[12px] font-medium text-[#c4c7c8] mt-3 flex items-center gap-1 font-mono uppercase tracking-wider">
              <TrendingUp className="w-[14px] h-[14px] text-emerald-500" />
              Revenue Realized
            </div>
          </div>
        </div>
      </section>

      {/* Data Tables Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Upcoming Streams Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[20px] leading-[1.4] font-medium text-[#ffffff]" style={{ fontFamily: "Geist, sans-serif" }}>Upcoming Streams</h3>
            <button className="text-[12px] font-medium text-[#c4c7c8] hover:text-[#ffffff] transition-colors flex items-center gap-1 font-mono uppercase tracking-widest">
              View all <ArrowRight className="w-[14px] h-[14px]" />
            </button>
          </div>
          <div className="border border-[#444748] bg-[#141313] rounded overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#353434] border-b border-[#444748] text-[12px] font-medium text-[#c4c7c8] font-mono uppercase tracking-widest">
                  <th className="py-3 px-4">Session Name</th>
                  <th className="py-3 px-4">Host</th>
                  <th className="py-3 px-4">Time (UTC)</th>
                  <th className="py-3 px-4 text-right">Reg.</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#e5e2e1]">
                {data.upcoming.length > 0 ? data.upcoming.map((item, i) => (
                  <tr key={i} className="border-b border-[#444748] hover:bg-[#1c1b1b] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#ffffff]" style={{ fontFamily: "Geist, sans-serif" }}>{item.title}</td>
                    <td className="py-3 px-4 text-[#c4c7c8]" style={{ fontFamily: "Geist, sans-serif" }}>{item.host}</td>
                    <td className="py-3 px-4 font-mono text-[13px]">{item.time}</td>
                    <td className="py-3 px-4 text-right font-mono text-[13px]">{item.reg}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
                      No upcoming sessions scheduled
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Debriefs Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[20px] leading-[1.4] font-medium text-[#ffffff]" style={{ fontFamily: "Geist, sans-serif" }}>Recent Debriefs</h3>
            <button className="text-[12px] font-medium text-[#c4c7c8] hover:text-[#ffffff] transition-colors flex items-center gap-1 font-mono uppercase tracking-widest">
              Archive <ArrowRight className="w-[14px] h-[14px]" />
            </button>
          </div>
          <div className="border border-[#444748] bg-[#141313] rounded overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#353434] border-b border-[#444748] text-[12px] font-medium text-[#c4c7c8] font-mono uppercase tracking-widest">
                  <th className="py-3 px-4">Session Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Conversion</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#e5e2e1]">
                {data.debriefs.length > 0 ? data.debriefs.map((item, i) => (
                  <tr key={i} className="border-b border-[#444748] hover:bg-[#1c1b1b] transition-colors group">
                    <td className="py-3 px-4 font-medium text-[#ffffff]" style={{ fontFamily: "Geist, sans-serif" }}>{item.title}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#201f1f] border border-[#444748] text-[12px] font-medium text-[#c4c7c8] font-mono uppercase tracking-tighter">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px]">{item.conversion}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#c4c7c8] hover:text-[#ffffff]">
                        <Download className="w-[18px] h-[18px]" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
                      No session debriefs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pages;
