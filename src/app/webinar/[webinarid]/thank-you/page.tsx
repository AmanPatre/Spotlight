"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PartyPopper, CheckCircle2, ArrowRight } from "lucide-react";
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
        <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-background to-teal-900/10 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg text-center">
                {/* Animated check icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-30" />
                        <div className="absolute inset-2 rounded-full bg-emerald-500/10" />
                        <CheckCircle2 className="w-14 h-14 text-emerald-400 relative z-10" />
                    </div>
                </div>

                {/* Heading */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <PartyPopper className="w-3 h-3" />
                    Payment Successful
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-4">
                    You&apos;re all set! 🎉
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed mb-2">
                    Thank you for your purchase. Full access has been unlocked and a
                    confirmation email is on its way to you.
                </p>

                {/* Order ID */}
                <div className="mt-6 mb-8 inline-block px-6 py-3 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
                    <p className="text-foreground font-mono font-bold text-sm">{orderId}</p>
                </div>

                {/* What's next */}
                <div className="bg-card border border-border rounded-3xl p-6 text-left mb-8 shadow-xl shadow-black/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-4">
                        What happens next
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Check your inbox for your access link",
                            "Join the members-only community group",
                            "Start your first lesson right now",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {webinarId && (
                        <Link
                            href={`/webinar/${webinarId}/live`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-lg shadow-emerald-600/20"
                        >
                            Back to Webinar
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-secondary border border-border text-foreground font-bold text-sm hover:bg-secondary/80 transition-all"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                <p className="text-center text-xs text-muted-foreground/40 mt-8">
                    This was a simulated purchase for demonstration purposes.
                </p>
            </div>
        </div>
    );
}
