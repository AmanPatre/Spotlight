"use client";

import React, { useState } from "react";
import { Check, CreditCard, Download, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-6 md:p-10 space-y-10 font-sans selection:bg-white/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>
            Billing & Payments
          </h1>
          <p className="text-[#a1a1aa] max-w-2xl text-base leading-relaxed">
            Manage your subscription, payment methods, and billing history. Your platform usage and limits are tied to your active plan.
          </p>
        </div>
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-full shadow-sm text-[13px] text-[#a1a1aa]">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="font-medium">Secure checkout via Razorpay</span>
          <div className="ml-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Subscription & Payment Method Grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Plan Card */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#27272a] rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
            <Zap className="w-48 h-48 text-zinc-500 rotate-12" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3" style={{ fontFamily: 'Geist, sans-serif' }}>
              Active Subscription
              <span className="bg-white/10 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                Pro Plan
              </span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-12">
            <div>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-white tracking-tighter">
                  ₹1,499<span className="text-xl text-[#71717a] font-medium tracking-normal ml-1">/mo</span>
                </p>
              </div>
              <p className="text-[13px] text-[#71717a] mt-2 font-medium uppercase tracking-wider italic opacity-80">Billed annually (₹17,988/year)</p>
            </div>

            <div className="hidden md:block w-px h-16 bg-[#27272a]" />

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-[#a1a1aa] font-medium uppercase tracking-widest">Webinar Minutes Used</span>
                <span className="text-white font-mono text-lg font-bold">4,500 / 10,000</span>
              </div>
              <div className="w-full bg-[#1c1c1c] rounded-full h-3.5 border border-[#27272a] overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <button className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 shadow-white/5">
              Upgrade Plan
            </button>
            <button className="bg-[#1a1a1a] text-[#a1a1aa] hover:text-white hover:bg-[#222222] border border-[#2e2e2e] px-8 py-3 rounded-lg text-sm font-bold transition-all active:scale-95">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-[#141414] border border-[#27272a] rounded-xl p-8 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 uppercase tracking-widest text-[14px]">Payment Method</h2>

            <div className="bg-black/40 border border-[#27272a] rounded-xl p-5 mb-6 group cursor-default">
              <div className="flex items-start gap-5">
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2e2e2e] group-hover:border-white/40 transition-colors">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-white font-mono text-base flex justify-between items-center tracking-wider">
                    <span>•••• 4242</span>
                    <span className="text-[10px] bg-[#1c1c1c] text-[#a1a1aa] border border-[#2e2e2e] px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Default</span>
                  </p>
                  <p className="text-[12px] text-[#71717a] font-medium uppercase tracking-widest">Expires 12/2028</p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#1a1a1a] text-white hover:bg-white hover:text-black border border-[#2e2e2e] px-4 py-3 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-all">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="pt-16 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Available Plans</h2>
          <div className="inline-flex items-center p-1.5 bg-[#141414] border border-[#27272a] rounded-xl shadow-inner">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2.5 text-sm font-bold rounded-lg transition-all tracking-wide",
                !isAnnual ? 'bg-white text-black shadow-xl' : 'text-[#71717a] hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 tracking-wide",
                isAnnual ? 'bg-white text-black shadow-xl' : 'text-[#71717a] hover:text-white'
              )}
            >
              Annually
              <span className={cn(
                "text-[10px] uppercase font-black px-2 py-0.5 rounded transition-colors",
                isAnnual ? "bg-white text-black" : "bg-[#1c1c1c] text-white"
              )}>Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-[#141414] border border-[#27272a] rounded-2xl p-8 flex flex-col hover:translate-y-[-4px] transition-all duration-300">
            <h3 className="text-2xl font-bold text-white tracking-tight">Starter</h3>
            <p className="text-[14px] text-[#71717a] mt-2 mb-6 font-medium">For individuals and small teams.</p>
            <div className="mb-8">
              <span className="text-5xl font-black text-white tracking-tighter">₹{isAnnual ? '499' : '599'}</span>
              <span className="text-[#71717a] text-lg font-medium">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {['Up to 100 attendees', 'Standard AI voice agents', '500 AI minutes/mo', 'Basic analytics'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px] text-[#a1a1aa] font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#1c1c1c] text-[#71717a] border border-[#2e2e2e] px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-[#222222]">
              Downgrade
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#141414] border-2 border-white relative rounded-2xl p-8 flex flex-col shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:translate-y-[-4px] transition-all duration-300">
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <span className="bg-white text-black text-[11px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Pro</h3>
            <p className="text-[14px] text-[#71717a] mt-2 mb-6 font-medium">For growing businesses.</p>
            <div className="mb-8">
              <span className="text-5xl font-black text-white tracking-tighter">₹{isAnnual ? '1,499' : '1,799'}</span>
              <span className="text-[#a1a1aa] text-lg font-medium">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {['Up to 500 attendees', 'Advanced AI voice agents', '10,000 AI minutes/mo', 'Custom branding', 'Priority support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white/90 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-white text-black px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-white/5">
              Current Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#141414] border border-[#27272a] rounded-2xl p-8 flex flex-col hover:translate-y-[-4px] transition-all duration-300">
            <h3 className="text-2xl font-bold text-white tracking-tight">Enterprise</h3>
            <p className="text-[14px] text-[#71717a] mt-2 mb-6 font-medium">For large scale operations.</p>
            <div className="mb-8">
              <span className="text-5xl font-black text-white tracking-tighter">₹{isAnnual ? '4,999' : '5,999'}</span>
              <span className="text-[#71717a] text-lg font-medium">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {['Unlimited attendees', 'Custom AI voice models', 'Unlimited AI minutes', 'Dedicated account manager', 'SSO & Advanced Security'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px] text-[#a1a1aa] font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-white text-black hover:bg-gray-200 px-4 py-3 rounded-xl text-sm font-bold transition-all">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="pt-20 relative">
        <h2 className="text-2xl font-bold text-white mb-8 tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Billing History</h2>
        <div className="bg-[#141414] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-[#71717a] uppercase font-black tracking-widest bg-black/40 border-b border-[#27272a]">
                <tr>
                  <th className="px-8 py-5 font-bold">Invoice</th>
                  <th className="px-8 py-5 font-bold">Date</th>
                  <th className="px-8 py-5 font-bold">Amount</th>
                  <th className="px-8 py-5 font-bold">Status</th>
                  <th className="px-8 py-5 font-bold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {[
                  { id: 'INV-2026-004', date: 'May 01, 2026', amount: '₹1,499.00', status: 'Paid' },
                  { id: 'INV-2026-003', date: 'Apr 01, 2026', amount: '₹1,499.00', status: 'Paid' },
                  { id: 'INV-2026-002', date: 'Mar 01, 2026', amount: '₹1,499.00', status: 'Paid' },
                  { id: 'INV-2026-001', date: 'Feb 01, 2026', amount: '₹1,499.00', status: 'Paid' },
                ].map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 text-white font-bold tracking-tight">{invoice.id}</td>
                    <td className="px-8 py-5 text-[#a1a1aa] font-medium">{invoice.date}</td>
                    <td className="px-8 py-5 text-white font-bold">{invoice.amount}</td>
                    <td className="px-8 py-5">
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-500/20">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-[#71717a] hover:text-white transition-all transform group-hover:scale-110">
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
