"use client";

import { cn } from "@/lib/utils";
import { LucideAlertCircle, LucideCheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

type SettingsClientProps = {
    userName: string;
    userEmail: string;
    isConnected: boolean;
    razorpayAccountId: string | null;
};

export default function SettingsClient({
    userName,
    userEmail,
    isConnected,
    razorpayAccountId,
}: SettingsClientProps) {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(isConnected);
    const [accountId, setAccountId] = useState(razorpayAccountId);
    const [error, setError] = useState<string | null>(null);

    const handleConnectBank = async () => {
        setConnecting(true);
        setError(null);
        try {
            const res = await fetch("/api/payment/razorpay/onboard", {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                setConnected(true);
                setAccountId(data.accountId);
            } else {
                setError(data.error || "Failed to connect bank account");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="flex-1 space-y-6">
            {/* Profile Section */}
            <section className="p-8 rounded border border-[#27272a] bg-[#141313] shadow-sm">
                <div className="border-b border-[#444748] pb-4 mb-8">
                    <h2
                        className="text-[18px] font-semibold text-[#ffffff] uppercase tracking-tight"
                        style={{ fontFamily: "Geist, sans-serif" }}
                    >
                        Profile Information
                    </h2>
                    <p className="text-[12px] font-mono text-[#c4c7c8] mt-1 uppercase tracking-widest">
                        Account Identification
                    </p>
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded bg-[#ffffff] border border-[#27272a] flex items-center justify-center text-[#141313] text-2xl font-bold shadow-inner">
                        {userName?.charAt(0) ?? "U"}
                    </div>
                    <div className="space-y-1">
                        <button className="text-[12px] font-bold text-[#ffffff] hover:text-[#c6c6c7] transition-colors underline underline-offset-4 tracking-widest uppercase">
                            Update Identity
                        </button>
                        <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-tighter">
                            Standard RGB Raster — Max 2.0MB
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[11px] font-mono text-[#c4c7c8] uppercase tracking-[0.2em] block">
                            Legal Name
                        </label>
                        <input
                            type="text"
                            defaultValue={userName ?? ""}
                            className="w-full h-11 px-4 text-sm bg-[#1c1b1b] border border-[#444748] rounded text-[#ffffff] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-mono text-[#c4c7c8] uppercase tracking-[0.2em] block">
                            Secure Email
                        </label>
                        <input
                            type="email"
                            defaultValue={userEmail ?? ""}
                            className="w-full h-11 px-4 text-sm bg-[#1c1b1b] border border-[#444748] rounded text-[#ffffff] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] transition-all"
                        />
                        <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-tight mt-2">
                            Primary communication node enabled
                        </p>
                    </div>
                </div>

                <button className="mt-10 px-8 py-3 rounded-none bg-[#ffffff] hover:bg-[#c6c6c7] text-[#141313] text-[12px] font-bold tracking-[0.2em] uppercase transition-all shadow-lg active:scale-[0.98]">
                    Sync Profile
                </button>
            </section>

            {/* Financial Gateway / Razorpay Connect */}
            <section className="p-8 rounded border border-[#27272a] bg-[#141313] shadow-sm">
                <div className="border-b border-[#444748] pb-4 mb-8 flex items-center justify-between">
                    <div>
                        <h2
                            className="text-[18px] font-semibold text-[#ffffff] uppercase tracking-tight"
                            style={{ fontFamily: "Geist, sans-serif" }}
                        >
                            Financial Gateway
                        </h2>
                        <p className="text-[12px] font-mono text-[#c4c7c8] mt-1 uppercase tracking-widest">
                            Razorpay Route Integration
                        </p>
                    </div>
                    <div
                        className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border",
                            connected
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        )}
                    >
                        {connected ? "System Online" : "Action Required"}
                    </div>
                </div>

                <div className="p-6 rounded bg-[#000000] border border-[#444748] mb-8 group hover:border-[#ffffff]/30 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded border border-[#444748] flex items-center justify-center shrink-0">
                            {connected ? (
                                <LucideCheckCircle2 className="h-5 w-5 text-[#ffffff]" />
                            ) : (
                                <LucideAlertCircle className="h-5 w-5 text-[#ffffff] animate-pulse" />
                            )}
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-[#ffffff] uppercase tracking-widest">
                                {connected
                                    ? "Payout Link Established"
                                    : "Payment Infrastructure Offline"}
                            </p>
                            <p className="text-[12px] font-mono text-[#71717a] mt-1 uppercase leading-relaxed">
                                {connected
                                    ? `Your account is verified. Live conversion processing is active. Account: ${accountId}`
                                    : "Razorpay connection is pending. Attendees cannot purchase during sessions."}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-500/5 border border-red-500/10 text-red-400 font-mono text-[10px] uppercase tracking-widest text-center rounded">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between gap-6 pt-4 border-t border-[#444748]/50">
                    <p className="text-[11px] font-mono text-[#52525b] uppercase tracking-widest max-w-sm">
                        {connected
                            ? "Linked account receives 100% of attendee payments via Razorpay Route"
                            : "Connect your bank account to receive payouts from attendee purchases"}
                    </p>
                    {!connected ? (
                        <button
                            onClick={handleConnectBank}
                            disabled={connecting}
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-none text-[12px] font-bold transition-all tracking-[0.2em] uppercase bg-[#ffffff] text-[#141313] hover:bg-[#c6c6c7] disabled:opacity-50"
                        >
                            {connecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Connect Bank Account"
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-none text-[12px] font-bold tracking-[0.2em] uppercase bg-[#1c1b1b] border border-[#444748] text-[#ffffff]">
                            <LucideCheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Connected
                        </div>
                    )}
                </div>
            </section>

            {/* Team & Security placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="p-6 rounded border border-[#27272a] bg-[#09090b] opacity-60">
                    <h2 className="text-[14px] font-bold text-[#ffffff] uppercase tracking-widest mb-2">
                        Access Control
                    </h2>
                    <p className="text-[11px] font-mono text-[#52525b] uppercase">
                        Multi-seat deployment locked in beta
                    </p>
                </section>

                <section className="p-6 rounded border border-[#27272a] bg-[#09090b] opacity-60">
                    <h2 className="text-[14px] font-bold text-[#ffffff] uppercase tracking-widest mb-2">
                        Hardened Security
                    </h2>
                    <p className="text-[11px] font-mono text-[#52525b] uppercase">
                        Hardware keys & TOTP pending rollout
                    </p>
                </section>
            </div>
        </div>
    );
}
