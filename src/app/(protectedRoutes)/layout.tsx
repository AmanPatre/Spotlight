import { onAuthenticateUser } from "@/actions/auth";
import Sidebar from "@/components/ui/ReusableComponent/LayoutComponents/Sidebar";
import Header from "@/components/ui/ReusableComponent/LayoutComponents/Header";

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
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-x-hidden overflow-y-auto px-6 scrollbar-hide">
        {/* Header */}
        <Header user={userExists.user} />

        <div className="flex-1 py-10">{children}</div>
      </div>
    </div>
  );
};

export default layout;
