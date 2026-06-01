import { getWebinarById } from "@/actions/webinar";
import { notFound } from "next/navigation";
import AttendeeLiveClient from "./_components/AttendeeLiveClient";
import LeaveButton from "./_components/LeaveButton";

type Props = {
  params: Promise<{ webinarid: string }>;
};

export default async function AttendeeLivePage({ params }: Props) {
  const { webinarid: webinarId } = await params;
  const webinar = await getWebinarById(webinarId);

  if (!webinar) notFound();

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <nav className="h-14 shrink-0 border-b border-zinc-800 flex items-center justify-between px-10 bg-[#141313] z-50">
        <div className="flex items-center gap-6">
          <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
            Spotlight Live
          </span>
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-white font-mono text-[11px] uppercase tracking-widest border-b border-white pb-1">
              Sessions
            </span>
            <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest hover:text-white transition-colors cursor-default px-2">
              Schedule
            </span>
            <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest hover:text-white transition-colors cursor-default px-2">
              Library
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <LeaveButton webinarId={webinarId} />
            <div className="h-4 w-px bg-zinc-800" />
            <button className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          </div>
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
      </nav>

      {/* ── Live Client ── */}
      <div className="flex-1 min-h-0">
        <AttendeeLiveClient
          webinarId={webinarId}
          aiAgentId={webinar.aiAgentId}
        />
      </div>
    </div>
  );
}
