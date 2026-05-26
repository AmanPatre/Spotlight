import { onAuthenticateUser } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { LucideAlertCircle, LucideArrowRight, LucideCheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const settingsTabs = [
  { id: "profile", label: "Profile" },
  { id: "team", label: "Team" },
  { id: "developer", label: "Developer API" },
  { id: "security", label: "Security" },
];

const page = async () => {
  const userExist = await onAuthenticateUser();

  if (!userExist.user) {
    redirect("/sign-in");
  }

  const isConnected = !!userExist?.user?.stripeConnectId;
  const razorpayLink = "/settings"; // Placeholder for now or actual link if exists

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Settings</h1>
        <p className="text-sm text-[#a1a1aa] mt-1">Manage your account, team, and integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Tab Nav */}
        <aside className="w-full lg:w-52 shrink-0">
          <nav className="flex flex-col gap-1">
            {settingsTabs.map((tab) => (
              <div
                key={tab.id}
                className={`px-3 py-2 rounded-sm text-[13px] font-medium cursor-pointer transition-all border-l-2 ${tab.id === "profile"
                  ? "bg-[#353434] border-[#ffffff] text-[#ffffff]"
                  : "border-transparent text-[#a1a1aa] hover:bg-[#1c1b1b] hover:text-[#fafafa]"
                  }`}
              >
                {tab.label.toUpperCase()}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Profile Section */}
          <section className="p-8 rounded border border-[#27272a] bg-[#141313] shadow-sm">
            <div className="border-b border-[#444748] pb-4 mb-8">
              <h2 className="text-[18px] font-semibold text-[#ffffff] uppercase tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Profile Information</h2>
              <p className="text-[12px] font-mono text-[#c4c7c8] mt-1 uppercase tracking-widest">Account Identification</p>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded bg-[#ffffff] border border-[#27272a] flex items-center justify-center text-[#141313] text-2xl font-bold shadow-inner">
                {userExist.user.name?.charAt(0) ?? "U"}
              </div>
              <div className="space-y-1">
                <button className="text-[12px] font-bold text-[#ffffff] hover:text-[#c6c6c7] transition-colors underline underline-offset-4 tracking-widest uppercase">
                  Update Identity
                </button>
                <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-tighter">Standard RGB Raster — Max 2.0MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-[#c4c7c8] uppercase tracking-[0.2em] block">Legal Name</label>
                <input
                  type="text"
                  defaultValue={userExist.user.name ?? ""}
                  className="w-full h-11 px-4 text-sm bg-[#1c1b1b] border border-[#444748] rounded text-[#ffffff] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-[#c4c7c8] uppercase tracking-[0.2em] block">Secure Email</label>
                <input
                  type="email"
                  defaultValue={userExist.user.email ?? ""}
                  className="w-full h-11 px-4 text-sm bg-[#1c1b1b] border border-[#444748] rounded text-[#ffffff] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-[#ffffff] transition-all"
                />
                <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-tight mt-2">Primary communication node enabled</p>
              </div>
            </div>

            <button className="mt-10 px-8 py-3 rounded-none bg-[#ffffff] hover:bg-[#c6c6c7] text-[#141313] text-[12px] font-bold tracking-[0.2em] uppercase transition-all shadow-lg active:scale-[0.98]">
              Sync Profile
            </button>
          </section>

          {/* Developer API / Stripe Connect */}
          <section className="p-8 rounded border border-[#27272a] bg-[#141313] shadow-sm">
            <div className="border-b border-[#444748] pb-4 mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-[#ffffff] uppercase tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Financial Gateway</h2>
                <p className="text-[12px] font-mono text-[#c4c7c8] mt-1 uppercase tracking-widest">Razorpay Account Integration</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border",
                isConnected ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-amber-500/10 border-amber-500/40 text-amber-400"
              )}>
                {isConnected ? "System Online" : "Action Required"}
              </div>
            </div>

            <div className="p-6 rounded bg-[#000000] border border-[#444748] mb-8 group hover:border-[#ffffff]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded border border-[#444748] flex items-center justify-center shrink-0">
                  {isConnected ? (
                    <LucideCheckCircle2 className="h-5 w-5 text-[#ffffff]" />
                  ) : (
                    <LucideAlertCircle className="h-5 w-5 text-[#ffffff] animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#ffffff] uppercase tracking-widest">
                    {isConnected ? "Payout Link Established" : "Payment Infrastructure Offline"}
                  </p>
                  <p className="text-[12px] font-mono text-[#71717a] mt-1 uppercase leading-relaxed">
                    {isConnected
                      ? "Your account is verified. Live conversion processing is active."
                      : "Razorpay connection is pending. Attendees cannot purchase during sessions."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 pt-4 border-t border-[#444748]/50">
              <p className="text-[11px] font-mono text-[#52525b] uppercase tracking-widest max-w-sm">
                Redirect to encrypted external gateway for protocol completion
              </p>
              <Link
                href={razorpayLink}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-none text-[12px] font-bold transition-all tracking-[0.2em] uppercase",
                  isConnected
                    ? "bg-[#1c1b1b] border border-[#444748] hover:border-[#ffffff] text-[#ffffff]"
                    : "bg-[#ffffff] text-[#141313] hover:bg-[#c6c6c7]"
                )}
              >
                {isConnected ? "Re-Calibrate" : "Authorize Gateway"}
                <LucideArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Team & Security placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="p-6 rounded border border-[#27272a] bg-[#09090b] opacity-60">
              <h2 className="text-[14px] font-bold text-[#ffffff] uppercase tracking-widest mb-2">Access Control</h2>
              <p className="text-[11px] font-mono text-[#52525b] uppercase">Multi-seat deployment locked in beta</p>
            </section>

            <section className="p-6 rounded border border-[#27272a] bg-[#09090b] opacity-60">
              <h2 className="text-[14px] font-bold text-[#ffffff] uppercase tracking-widest mb-2">Hardened Security</h2>
              <p className="text-[11px] font-mono text-[#52525b] uppercase">Hardware keys & TOTP pending rollout</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
