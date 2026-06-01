import PageHeader from "@/components/ui/ReusableComponent/PageHeader";
import { Cpu } from "lucide-react";
import React from "react";
import AiAgentsClient from "./_components/AiAgentsClient";

export default function AiAgentsPage() {
  return (
    <div className="w-full flex flex-col gap-8 p-8">
      <PageHeader
        leftIcon={<Cpu className="w-3 h-3" />}
        mainIcon={<Cpu className="w-8 h-8 text-[#ffffff]" />}
        rightIcon={<Cpu className="w-3 h-3 opacity-0" />}
        heading="AI Agents"
        placeholder="Search assistants..."
      />

      <AiAgentsClient />
    </div>
  );
}
