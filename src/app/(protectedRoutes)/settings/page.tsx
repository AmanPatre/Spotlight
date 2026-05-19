import { onAuthenticateUser } from "@/actions/auth";
import { getStripeOAuthLink } from "@/lib/stripe/utils";
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
  const stripeLink = getStripeOAuthLink("api/stripe-connect", userExist.user.id);

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
                className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${tab.id === "developer"
                    ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                    : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]"
                  }`}
              >
                {tab.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Profile Section */}
          <section className="p-6 rounded-lg border border-[#27272a] bg-[#18181b]">
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">Profile Information</h2>
            <p className="text-xs text-[#71717a] mb-5">Update your account details and public presence.</p>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xl font-semibold">
                {userExist.user.name?.charAt(0) ?? "U"}
              </div>
              <div>
                <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Upload photo
                </button>
                <p className="text-xs text-[#52525b] mt-0.5">JPEG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#71717a] block mb-1.5">Full Name</label>
                <input
                  type="text"
                  defaultValue={userExist.user.name ?? ""}
                  className="w-full h-8 px-3 text-sm bg-[#0e0e10] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-[#71717a] block mb-1.5">Email Address</label>
                <input
                  type="email"
                  defaultValue={userExist.user.email ?? ""}
                  className="w-full h-8 px-3 text-sm bg-[#0e0e10] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
                />
                <p className="text-xs text-[#52525b] mt-1">Used for billing and important notifications.</p>
              </div>
            </div>

            <button className="mt-5 px-4 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
              Save Changes
            </button>
          </section>

          {/* Developer API / Stripe Connect */}
          <section className="p-6 rounded-lg border border-[#27272a] bg-[#18181b]">
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">Developer API</h2>
            <p className="text-xs text-[#71717a] mb-5">Connect your Stripe account to accept payments from webinar attendees.</p>

            <div className="flex items-start gap-3 p-4 rounded-md bg-[#0e0e10] border border-[#27272a] mb-5">
              {isConnected ? (
                <LucideCheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <LucideAlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-[#fafafa]">
                  {isConnected ? "Stripe account connected" : "Stripe account not connected"}
                </p>
                <p className="text-xs text-[#71717a] mt-0.5">
                  {isConnected
                    ? "You can now accept payments through your webinars."
                    : "Connect your Stripe account to start processing payments."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-[#71717a]">
                {isConnected ? "You can reconnect anytime if needed." : "You'll be redirected to Stripe to complete the connection."}
              </p>
              <Link
                href={stripeLink}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isConnected
                    ? "bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa]"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
              >
                {isConnected ? "Reconnect" : "Connect with Stripe"}
                <LucideArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* Team & Security placeholders */}
          <section className="p-6 rounded-lg border border-[#27272a] bg-[#18181b]">
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">Team Members</h2>
            <p className="text-xs text-[#71717a]">Invite colleagues and manage access roles.</p>
            <p className="text-xs text-[#52525b] mt-4 italic">Team management coming soon.</p>
          </section>

          <section className="p-6 rounded-lg border border-[#27272a] bg-[#18181b]">
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">Security</h2>
            <p className="text-xs text-[#71717a]">Manage two-factor authentication and active sessions.</p>
            <p className="text-xs text-[#52525b] mt-4 italic">Security settings coming soon.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default page;
