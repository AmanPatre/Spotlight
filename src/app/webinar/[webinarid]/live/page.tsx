import { getWebinarById } from "@/actions/webinar";
import { notFound } from "next/navigation";
import AttendeeLiveClient from "./_components/AttendeeLiveClient";

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
        <div className="flex items-center gap-4">
          <button className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
          <button className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center ml-2">
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
