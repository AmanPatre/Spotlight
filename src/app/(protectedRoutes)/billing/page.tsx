"use client";

import React, { useState, useEffect } from "react";
import { Check, CreditCard, Download, ShieldCheck, Sparkles, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { onAuthenticateUser } from "@/actions/auth";
import { useUser } from "@clerk/nextjs";

export default function BillingPage() {
  const { user: clerkUser } = useUser();
  const [isAnnual, setIsAnnual] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load payment gateway");
    document.body.appendChild(script);

    // Fetch user data
    const fetchUser = async () => {
      const auth = await onAuthenticateUser();
      if (auth.user) {
        setUserData(auth.user);
      }
      setIsPageLoading(false);
    };
    fetchUser();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async () => {
    if (userData?.isPro) {
      alert("You already have an active Pro Pass!");
      return;
    }

    setIsCheckoutLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/razorpay/subscription", {
        method: "POST",
      });
      const order = await res.json();

      if (!res.ok) {
        setError(order.error || "Failed to initiate checkout");
        setIsCheckoutLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Spotlight Pro",
        description: "30-Day Pro Pass Membership",
        order_id: order.id,
        prefill: {
          name: clerkUser?.fullName || userData?.name || "",
          email: clerkUser?.primaryEmailAddress?.emailAddress || userData?.email || "",
        },
        theme: {
          color: "#000000",
        },
        handler: async function (response: any) {
          // The webhook handles the actual activation, but we can show immediate success
          alert("Payment Successful! Your Pro status will be activated in a few moments.");
          window.location.reload();
        },
        modal: {
          ondismiss: () => setIsCheckoutLoading(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Checkout failed. Please try again.");
      setIsCheckoutLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const isPro = userData?.isPro;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-6 md:p-10 space-y-10 font-sans selection:bg-white/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-zinc-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>
            Billing & Payments
          </h1>
          <p className="text-[#a1a1aa] max-w-2xl text-base leading-relaxed">
            Manage your subscription and unlock premium features. Pro Pass holders can create unlimited webinars and use AI voice agents.
          </p>
        </div>
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-full shadow-sm text-[13px] text-[#a1a1aa]">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="font-medium underline decoration-zinc-700 underline-offset-4">Verified Razorpay Gateway</span>
          <div className={cn("ml-1 w-2 h-2 rounded-full", isPro ? "bg-white animate-pulse" : "bg-zinc-700")} />
        </div>
      </div>

      {/* Subscription Card */}
      <div className="relative">
        <div className="bg-[#141414] border border-[#27272a] rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
            <Zap className="w-48 h-48 text-zinc-500 rotate-12" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3" style={{ fontFamily: 'Geist, sans-serif' }}>
              Active Subscription
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                isPro ? "bg-white/10 text-white border-white/20" : "bg-zinc-900 text-zinc-500 border-zinc-800"
              )}>
                {isPro ? "Pro Pass Active" : "No Active Pass"}
              </span>
            </h2>
            {userData?.proExpiresAt && (
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Expires: {new Date(userData.proExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-12">
            <div>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-white tracking-tighter">
                  ₹1,499<span className="text-xl text-[#71717a] font-medium tracking-normal ml-1">/30d</span>
                </p>
              </div>
              <p className="text-[13px] text-[#71717a] mt-2 font-medium uppercase tracking-wider opacity-80 italic">Standard Platform Access Fee</p>
            </div>

            <div className="hidden md:block w-px h-16 bg-[#27272a]" />

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-[#a1a1aa] font-medium uppercase tracking-widest">Webinar Creation Limit</span>
                <span className="text-white font-mono text-lg font-bold">{isPro ? "UNLIMITED" : "0 / 0"}</span>
              </div>
              <div className="w-full bg-[#1c1c1c] rounded-full h-3.5 border border-[#27272a] overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  style={{ width: isPro ? "100%" : "0%" }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            {!isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={isCheckoutLoading}
                className="bg-white text-black hover:bg-zinc-200 px-10 py-4 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center gap-3 uppercase tracking-widest"
              >
                {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Buy Pro Pass
              </button>
            ) : (
              <div className="bg-white/5 border border-white/10 px-8 py-3 rounded-lg text-sm font-bold text-white flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                Active Subscription
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Table (Visual Only for context) */}
      <div className="pt-20">
        <h2 className="text-center text-4xl font-black text-white mb-16 tracking-tight">Available Membership</h2>
        <div className="max-w-md mx-auto">
          <div className="bg-[#141414] border-2 border-white relative rounded-2xl p-10 flex flex-col shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <span className="bg-white text-black text-[11px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Recommended
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Prepaid Pro Pass</h3>
            <p className="text-[14px] text-[#71717a] mt-2 mb-8 font-medium italic">Unlocked via instant Razorpay payment.</p>
            <div className="mb-10">
              <span className="text-6xl font-black text-white tracking-tighter">₹1,499</span>
              <span className="text-[#a1a1aa] text-lg font-medium ml-2">/month</span>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              {[
                "Unlimited Webinar Creation",
                "Advanced AI Voice Agents",
                "HD 1080p Recording",
                "Custom CTA Links",
                "Priority Marketplace Transfers",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-4 text-white/90 font-medium text-sm">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={isPro || isCheckoutLoading}
              className={cn(
                "w-full px-4 py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98]",
                isPro
                  ? "bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800"
                  : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {isPro ? "Already Pro" : "Upgrade to Pro Now"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-center font-mono text-xs uppercase tracking-widest rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
