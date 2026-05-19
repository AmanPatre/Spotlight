"use client";

import React, { useState } from "react";
import { Check, CreditCard, Download, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function BillingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Billing & Payments
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
            Manage your subscription, payment methods, and billing history. Your platform usage and limits are tied to your active plan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Secure checkout via Stripe</span>
        </div>
      </div>

      {/* Current Subscription & Payment Method Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Zap className="w-24 h-24 text-primary" />
          </div>
          
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            Active Subscription
            <span className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/30">
              Pro Plan
            </span>
          </h2>
          
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-6">
            <div>
              <p className="text-4xl font-bold text-foreground">
                $49<span className="text-lg text-muted-foreground font-normal">/mo</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Billed annually ($588/year)</p>
            </div>
            
            <div className="h-px w-full md:w-px md:h-12 bg-border"></div>
            
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Webinar Minutes Used</span>
                <span className="text-foreground font-medium">4,500 / 10,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Upgrade Plan
            </button>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Payment Method</h2>
          
          <div className="bg-secondary border border-border rounded-md p-4 mb-4 flex items-start gap-4">
            <div className="bg-background p-2 rounded border border-border">
              <CreditCard className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium flex justify-between">
                <span>•••• •••• •••• 4242</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded uppercase tracking-wider">Default</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Expires 12/2028</p>
            </div>
          </div>
          
          <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-md text-sm font-medium transition-colors mb-2">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="pt-8 border-t border-border">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Available Plans</h2>
          <div className="inline-flex items-center p-1 bg-secondary border border-border rounded-lg">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${!isAnnual ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${isAnnual ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Annually <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-medium text-foreground">Starter</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">For individuals and small teams.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">${isAnnual ? '19' : '24'}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['Up to 100 attendees', 'Standard AI voice agents', '500 AI minutes/mo', 'Basic analytics'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Downgrade
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border border-primary relative rounded-lg p-6 flex flex-col shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full border border-primary-foreground/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </span>
            </div>
            <h3 className="text-lg font-medium text-foreground">Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">For growing businesses.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">${isAnnual ? '49' : '59'}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['Up to 500 attendees', 'Advanced AI voice agents', '10,000 AI minutes/mo', 'Custom branding', 'Priority support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-secondary border border-border px-4 py-2 rounded-md text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50">
              Current Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-medium text-foreground">Enterprise</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">For large scale operations.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">${isAnnual ? '199' : '249'}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['Unlimited attendees', 'Custom AI voice models', 'Unlimited AI minutes', 'Dedicated account manager', 'SSO & Advanced Security'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="pt-8 border-t border-border">
        <h2 className="text-lg font-medium text-foreground mb-4">Billing History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-y border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { id: 'INV-2026-004', date: 'May 01, 2026', amount: '$49.00', status: 'Paid' },
                { id: 'INV-2026-003', date: 'Apr 01, 2026', amount: '$49.00', status: 'Paid' },
                { id: 'INV-2026-002', date: 'Mar 01, 2026', amount: '$49.00', status: 'Paid' },
                { id: 'INV-2026-001', date: 'Feb 01, 2026', amount: '$49.00', status: 'Paid' },
              ].map((invoice) => (
                <tr key={invoice.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4 text-foreground font-medium">{invoice.id}</td>
                  <td className="px-4 py-4 text-muted-foreground">{invoice.date}</td>
                  <td className="px-4 py-4 text-foreground">{invoice.amount}</td>
                  <td className="px-4 py-4">
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium border border-primary/20">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-muted-foreground hover:text-primary transition-colors p-1">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
