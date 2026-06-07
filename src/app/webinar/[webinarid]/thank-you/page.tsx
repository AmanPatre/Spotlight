"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

type Props = {
    params: Promise<{ webinarid: string }>;
};

export default function ThankYouPage({ params }: Props) {
    const searchParams = useSearchParams();
    const [webinarId, setWebinarId] = useState("");
    const orderId = searchParams.get("orderId") ?? "—";

    useEffect(() => {
        params.then(({ webinarid }) => setWebinarId(webinarid));
    }, [params]);

    return (
        <div className="relative min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-xl text-center">
                {/* Check icon */}
                <div className="flex justify-center mb-10">
                    <div className="w-20 h-20 rounded-none border border-zinc-800 bg-white/5 flex items-center justify-center relative">
                        <div className="absolute inset-[-1px] border border-white/10 opacity-50" />
                        <CheckCircle2 className="w-8 h-8 text-white relative z-10" />
                    </div>
                </div>

                {/* Heading */}
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 bg-white/5 rounded-none font-mono text-[10px] uppercase tracking-[0.3em] text-white mb-6">
                    Payment Successful
                </div>

                <h1 className="text-5xl font-semibold tracking-tight text-white mb-6" style={{ fontFamily: "Geist, sans-serif" }}>
                    You&apos;re all set
                </h1>
                <p className="text-zinc-500 font-mono text-[11px] uppercase tracking-[0.2em] leading-relaxed mb-12 max-w-md mx-auto">
                    Thank you for your purchase. Full access has been unlocked and a
                    confirmation email is on its way to you.
                </p>

                {/* Order ID */}
                <div className="mb-12 inline-flex flex-col items-center">
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em] mb-2">Order Reference</p>
                    <div className="px-4 py-2 border border-zinc-900 bg-zinc-950/50">
                        <p className="text-white font-mono text-[11px] tracking-widest uppercase">{orderId}</p>
                    </div>
                </div>

                {/* What's next */}
                <div className="bg-[#141313] border border-zinc-800 rounded-none p-8 text-left mb-10">
                    <p className="text-[10px] font-mono text-white uppercase tracking-[0.3em] mb-6 border-b border-zinc-900 pb-4">
                        What happens next
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Check your inbox for your access link",
                            "Join the members-only community group",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-4 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                                <div className="w-4 h-4 border border-zinc-800 bg-white/5 flex items-center justify-center shrink-0 mt-[-1px]">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {webinarId && (
                        <Link
                            href={`/webinar/${webinarId}/live`}
                            className="h-14 px-8 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
                        >
                            Back to Webinar
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                    <Link
                        href={`/webinar/${webinarId}`}
                        className="h-14 px-8 border border-zinc-800 bg-transparent text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/5 transition-colors flex items-center justify-center"
                    >
                        Webinar Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
