import { onAuthenticateUser } from "@/actions/auth";
import Sidebar from "@/components/ui/ReusableComponent/LayoutComponents/Sidebar";

import { redirect } from "next/navigation";
import React from "react";
type Props = {
  children: React.ReactNode;
};
const layout = async ({ children }: Props) => {
  const userExists = await onAuthenticateUser();

  if (!userExists.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex w-full min-h-screen bg-[#141313] text-[#e5e2e1] font-[family-name:var(--font-geist)]">
      {/* Sidebar - fixed 240px */}
      <Sidebar />

      {/* Main content: fill remaining space after fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto ml-[240px]">
        <main className="flex-1 p-6 lg:p-10 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default layout;
