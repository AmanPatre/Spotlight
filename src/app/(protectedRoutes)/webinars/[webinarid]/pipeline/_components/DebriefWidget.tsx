import React from "react";
import { Badge } from "@/components/ui/badge";
import { FlameIcon } from "lucide-react";

interface Debrief {
    score: number;
    summary: string | null;
    isHotLead: boolean;
    attendance: {
        attendeeId: string;
        user?: { name: string };
    };
}

interface Props {
    debriefs: Debrief[];
    totalAttendeesCount: number;
}

export default function DebriefWidget({ debriefs, totalAttendeesCount }: Props) {
    if (!debriefs || debriefs.length === 0) return null;

    const hotLeads = debriefs.filter((d) => d.score >= 8 || d.isHotLead);
    const hotLeadsCount = hotLeads.length;

    // Extract names of the hot leads for actionable insights
    const hotLeadNames = hotLeads
        .map(h => h.attendance.user?.name)
        .filter(Boolean)
        .slice(0, 3);

    const namesList = hotLeadNames.length > 0
        ? (hotLeadNames.length === 1
            ? hotLeadNames[0]
            : hotLeadNames.slice(0, -1).join(", ") + " and " + hotLeadNames[hotLeadNames.length - 1])
        : "";

    // Mock calculation metric, e.g., $1200 per converted hot lead
    const pipelineValue = hotLeadsCount * 1200;

    return (
        <div className="w-full bg-background/5 border border-border p-6 rounded-2xl mb-8 flex flex-col md:flex-row shadow-sm gap-6 justify-between items-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5">

            {/* Left side stats */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-12 w-full md:w-auto">
                <div className="space-y-1">
                    <p className="text-sm text-foreground/60">Total AI Debriefs</p>
                    <p className="text-3xl font-bold">{debriefs.length} <span className="text-sm font-normal text-foreground/40">/ {totalAttendeesCount} calls</span></p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-foreground/60">Hot Leads</p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold">{hotLeadsCount}</p>
                        {hotLeadsCount > 0 && (
                            <Badge variant="default" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                <FlameIcon className="w-3 h-3 mr-1" />
                                Score 8+
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-foreground/60">Pipeline Value</p>
                    <p className="text-3xl font-bold text-green-500/90">${pipelineValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Actionable Insight */}
            <div className="w-full md:w-[40%] bg-background/40 p-4 rounded-xl border border-border/50 text-sm">
                <p className="font-semibold mb-1 text-foreground/80">Actionable Insight</p>
                <p className="text-foreground/60 leading-relaxed">
                    {hotLeadsCount > 0
                        ? `Your AI agent identified ${hotLeadsCount} attendees with immediate buying intent. Top leads include ${namesList}. Prioritize these callbacks today!`
                        : "The AI agent has summarized the calls. Currently, no attendees scored high enough to be classified as immediate hot leads. Consider following up with mid-tier participants."}
                </p>
            </div>

        </div>
    );
}
