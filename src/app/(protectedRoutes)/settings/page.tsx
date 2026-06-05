import { onAuthenticateUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

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

  const isConnected = !!userExist?.user?.razorpayAccountId;

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

        {/* Main content - Client Component */}
        <SettingsClient
          userName={userExist.user.name ?? ""}
          userEmail={userExist.user.email ?? ""}
          isConnected={isConnected}
          razorpayAccountId={userExist.user.razorpayAccountId ?? null}
        />
      </div>
    </div>
  );
};

export default page;
