import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="bg-[#141313] text-[#e5e2e1] font-[family-name:var(--font-geist)] antialiased min-h-screen flex flex-col pt-16">
      {/* TopNavBar */}
      <nav className="bg-[#141313] fixed top-0 w-full z-50 border-b border-[#444748] h-16 flex items-center">
        <div className="flex justify-between items-center px-4 md:px-10 w-full max-w-[1440px] mx-auto">
          <div className="text-[20px] leading-[1.4] font-bold text-[#ffffff] tracking-tight">Spotlight</div>
          <div className="hidden md:flex gap-6 items-center">
            <a className="text-[14px] text-[#c4c7c8] hover:text-[#ffffff] transition-colors" href="#">Features</a>
            <a className="text-[14px] text-[#c4c7c8] hover:text-[#ffffff] transition-colors" href="#">Solutions</a>
            <a className="text-[14px] text-[#c4c7c8] hover:text-[#ffffff] transition-colors" href="#">Documentation</a>
            <a className="text-[14px] text-[#c4c7c8] hover:text-[#ffffff] transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex gap-6 items-center">
            {userId ? (
              <Link href="/home" className="text-[12px] font-medium bg-[#ffffff] text-[#0e0e0e] px-4 py-2 rounded scale-95 active:opacity-80 hover:bg-[#e2e2e2] transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="hidden md:inline-block text-[12px] font-medium text-[#c4c7c8] hover:text-[#ffffff] scale-95 active:opacity-80 transition-all" href="/sign-in">Login</Link>
                <Link href="/sign-up" className="text-[12px] font-medium bg-[#ffffff] text-[#0e0e0e] px-4 py-2 rounded scale-95 active:opacity-80 hover:bg-[#e2e2e2] transition-colors">Start Building</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-[1440px] px-4 md:px-10 py-32 md:py-48 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4447481a_1px,transparent_1px),linear-gradient(to_bottom,#4447481a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-[48px] leading-[1.1] font-semibold text-[#ffffff] max-w-4xl tracking-tighter">
              Stream the Webinar. <br className="hidden md:block" />Let AI Close the Deals.
            </h1>
            <p className="text-[16px] leading-[1.6] text-[#c4c7c8] mt-6 max-w-2xl">
              Zero-latency streaming meets autonomous voice agents. A unified infrastructure built for high-performance technical environments.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
              <Link href={userId ? "/home" : "/sign-up"} className="w-full sm:w-auto text-[12px] font-medium bg-[#ffffff] text-[#0e0e0e] px-6 py-3 rounded hover:bg-[#e2e2e2] transition-colors flex items-center justify-center gap-2">
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full sm:w-auto text-[12px] font-medium border border-[#444748] bg-transparent text-[#ffffff] px-6 py-3 rounded hover:bg-[#201f1f] transition-colors">
                Read Docs
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="w-full max-w-[1440px] px-4 md:px-10 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {/* Card 1: Real-Time Infrastructure (Spans 8 cols) */}
            <div className="md:col-span-8 bg-[#141313] border border-[#444748] rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="z-10 relative max-w-md">
                <div className="text-[12px] font-medium text-[#c4c7c8] mb-4 px-2 py-1 border border-[#444748] rounded inline-block bg-[#201f1f]">SYSTEM.CORE</div>
                <h3 className="text-[20px] font-medium text-[#ffffff] tracking-tight">Real-Time Infrastructure</h3>
                <p className="text-[14px] text-[#c4c7c8] mt-2">Engineered for sub-second latency globally. Ensure your stream and bidirectional data flows are delivered precisely when it matters, with zero perceptible delay.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-[120%] bg-gradient-to-l from-[#2a2a2a]/20 to-transparent translate-x-4 translate-y-8 group-hover:translate-x-0 group-hover:translate-y-4 transition-transform duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8e919233_1px,transparent_1px)] bg-[size:16px_100%]"></div>
              </div>
            </div>

            {/* Card 2: Vapi Voice Breakouts (Spans 4 cols) */}
            <div className="md:col-span-4 bg-[#141313] border border-[#444748] rounded-xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-[12px] font-medium text-[#c4c7c8] mb-4 px-2 py-1 border border-[#444748] rounded inline-block bg-[#201f1f]">MODULE.VOICE</div>
                <h3 className="text-[20px] font-medium text-[#ffffff] tracking-tight">Vapi Voice Breakouts</h3>
                <p className="text-[14px] text-[#c4c7c8] mt-2">Autonomous voice agents engage attendees instantly post-webinar.</p>
              </div>
              <div className="flex justify-end mt-4">
                <div className="h-12 w-12 rounded-full border border-[#444748] bg-[#201f1f] flex items-center justify-center">
                  <Mic className="w-6 h-6 text-[#ffffff]" />
                </div>
              </div>
            </div>

            {/* Card 3: Asynchronous Lead Routing (Spans 12 cols) */}
            <div className="md:col-span-12 bg-[#141313] border border-[#444748] rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
              <div className="z-10 relative max-w-xl">
                <div className="text-[12px] font-medium text-[#c4c7c8] mb-4 px-2 py-1 border border-[#444748] rounded inline-block bg-[#201f1f]">ROUTING.ASYNC</div>
                <h3 className="text-[20px] font-medium text-[#ffffff] tracking-tight">Asynchronous Lead Routing</h3>
                <p className="text-[14px] text-[#c4c7c8] mt-2">Intelligent parsing algorithms that distribute qualified, context-rich leads directly to your CRM infrastructure based on real-time engagement heuristics.</p>
              </div>
              <div className="z-10 relative flex flex-col gap-1 min-w-[240px]">
                <div className="flex items-center justify-between p-3 border border-[#444748] rounded bg-[#201f1f] font-mono text-[13px] text-[#c4c7c8]">
                  <span>Webhook Status</span>
                  <span className="text-[#ffffff] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ffffff] inline-block"></span> 200 OK</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-[#444748] rounded bg-[#201f1f] font-mono text-[13px] text-[#c4c7c8]">
                  <span>Processing Time</span>
                  <span className="text-[#ffffff]">12ms</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-[#444748] rounded bg-[#201f1f] font-mono text-[13px] text-[#c4c7c8]">
                  <span>CRM Target</span>
                  <span className="text-[#ffffff]">Salesforce</span>
                </div>
              </div>
              {/* Ambient Glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#e2e2e2]/5 rounded-full blur-[100px] pointer-events-none"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#141313] w-full py-8 border-t border-[#444748] mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 max-w-[1440px] mx-auto gap-6">
          <div className="text-[20px] font-bold text-[#ffffff] tracking-tight">Spotlight</div>
          <div className="flex gap-6 text-[12px] font-medium">
            <a className="text-[#c4c7c8] hover:text-[#ffffff] transition-colors opacity-100 hover:opacity-80" href="#">Privacy</a>
            <a className="text-[#c4c7c8] hover:text-[#ffffff] transition-colors opacity-100 hover:opacity-80" href="#">Terms</a>
            <a className="text-[#c4c7c8] hover:text-[#ffffff] transition-colors opacity-100 hover:opacity-80" href="#">Security</a>
            <a className="text-[#c4c7c8] hover:text-[#ffffff] transition-colors opacity-100 hover:opacity-80" href="#">Status</a>
          </div>
          <div className="text-[12px] font-medium text-[#c4c7c8] text-center md:text-right">
            © 2026 Spotlight Enterprise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}