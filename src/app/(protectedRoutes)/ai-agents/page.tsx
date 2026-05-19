import PageHeader from "@/components/ui/ReusableComponent/PageHeader";
import { PipelineIcon } from "@/icons/PipelineIcon";
import { Sparkles } from "lucide-react";
import React from "react";
import AiAgentsClient from "./_components/AiAgentsClient";

export default function AiAgentsPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<Sparkles className="w-3 h-3" />}
        mainIcon={<Sparkles className="w-12 h-12 text-purple-400" />}
        rightIcon={<PipelineIcon className="w-3 h-3" />}
        heading="AI Agents"
        placeholder="Search assistants..."
      />

      <AiAgentsClient />
    </div>
  );
}
