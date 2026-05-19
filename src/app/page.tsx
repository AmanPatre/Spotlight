import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Mic,
  Users,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Real-Time Voice AI",
    description:
      "Deploy hyper-realistic voice agents that interact with your audience in real-time, capturing intent and qualifying leads.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Track attendee engagement, conversion funnels, and AI call performance with a unified analytics dashboard.",
  },
  {
    icon: Users,
    title: "Pipeline Management",
    description:
      "Visualize your lead pipeline from registered → attending → AI breakout → converted in one clean view.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SAML SSO, audit logs, and dedicated infrastructure ensure your data is always protected.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$99",
    period: "/mo",
    description: "For emerging teams launching their first automated webinars.",
    features: [
      "Up to 5 Live AI Agents",
      "1,000 Voice Minutes /mo",
      "Standard CRM Integrations",
      "Basic Analytics",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    badge: "Most Popular",
    price: "$299",
    period: "/mo",
    description: "For scaling organizations requiring deep customization.",
    features: [
      "Unlimited Live AI Agents",
      "10,000 Voice Minutes /mo",
      "Advanced Behavioral Analytics",
      "Custom Voice Cloning",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Custom deployment for global events and maximum security.",
    features: [
      "Dedicated Infrastructure",
      "Unlimited Voice Minutes",
      "SAML SSO & Audit Logs",
      "24/7 Priority Support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-[family-name:var(--font-geist)]">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#fafafa]">Spotlight</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-[#a1a1aa]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {userId ? (
              <Link
                href="/home"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-[#a1a1aa] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-600/10 text-violet-400 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          Voice AI × Webinar Automation
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold leading-tight tracking-tight mb-6">
          Turn Passive Viewers into{" "}
          <span className="text-violet-400">Active Leads</span>
          <br />
          with Voice AI.
        </h1>
        <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto mb-10">
          Automate your webinar engagement. Deploy hyper-realistic voice agents
          that interact with your audience in real-time, capturing intent and
          qualifying leads before the session ends.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={userId ? "/home" : "/sign-up"}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
          >
            {userId ? "Go to Dashboard" : "Start for Free"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 px-6 py-2.5 rounded-md border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] font-medium transition-colors"
          >
            See Features
          </a>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold mb-3">
              Everything you need to automate engagement
            </h2>
            <p className="text-[#a1a1aa] max-w-xl mx-auto">
              Spotlight combines AI voice technology, real-time analytics, and CRM pipelines into one unified platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-lg border border-[#27272a] bg-[#18181b] hover:border-violet-500/40 hover:bg-[#1c1c1f] transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-md bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <f.icon className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="font-medium text-sm mb-2">{f.title}</h3>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold mb-3">Predictable Enterprise Pricing</h2>
            <p className="text-[#a1a1aa]">
              Scale your automated engagement with transparent tiers designed for high-volume B2B operations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-6 rounded-lg border flex flex-col transition-all ${tier.highlight
                    ? "border-violet-500/60 bg-violet-600/5"
                    : "border-[#27272a] bg-[#18181b]"
                  }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium bg-violet-600 text-white">
                    {tier.badge}
                  </span>
                )}
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#a1a1aa] mb-1">{tier.name}</p>
                  <p className="text-3xl font-semibold">
                    {tier.price}
                    <span className="text-sm text-[#a1a1aa] font-normal">{tier.period}</span>
                  </p>
                  <p className="text-xs text-[#71717a] mt-2">{tier.description}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {tier.features.map((ft) => (
                    <li key={ft} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                      <CheckCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      {ft}
                    </li>
                  ))}
                </ul>
                <Link
                  href={userId ? "/home" : "/sign-up"}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${tier.highlight
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa]"
                    }`}
                >
                  {tier.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272a] py-8 px-6 text-center text-[#52525b] text-sm">
        <p>© 2026 Spotlight. All rights reserved.</p>
      </footer>
    </div>
  );
}