import PageHeader from "@/components/ui/ReusableComponent/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadIcon } from "@/icons/LeadIcon";
import { PipelineIcon } from "@/icons/PipelineIcon";
import { Webcam, UserCheck, Mic, Trophy, Video } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getAllLeads } from "@/actions/attendence";
import { AttendedTypeEnum } from "@/generated/prisma/enums";

export const dynamic = 'force-dynamic';

export default async function LeadPage() {
  const { success, leads } = await getAllLeads();

  const counts = {
    registered: 0,
    attending: 0,
    aiCall: 0,
    converted: 0,
  };

  if (success && leads) {
    counts.registered = leads.length;
    leads.forEach((l) => {
      if (
        l.attendedType === AttendedTypeEnum.ATTENDED ||
        l.attendedType === AttendedTypeEnum.ADDED_TO_CART ||
        l.attendedType === AttendedTypeEnum.FOLLOW_UP ||
        l.attendedType === AttendedTypeEnum.BREAKOUT_ROOM ||
        l.attendedType === AttendedTypeEnum.CONVERTED
      ) {
        counts.attending++;
      }
      if (
        l.attendedType === AttendedTypeEnum.ADDED_TO_CART ||
        l.attendedType === AttendedTypeEnum.FOLLOW_UP ||
        l.attendedType === AttendedTypeEnum.BREAKOUT_ROOM ||
        l.attendedType === AttendedTypeEnum.CONVERTED
      ) {
        counts.aiCall++;
      }
      if (l.attendedType === AttendedTypeEnum.CONVERTED) {
        counts.converted++;
      }
    });
  }

  const statusColumns = [
    { label: "Registered", icon: Webcam, count: counts.registered, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Attending", icon: UserCheck, count: counts.attending, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "AI Call", icon: Mic, count: counts.aiCall, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Converted", icon: Trophy, count: counts.converted, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<Webcam className="w-3 h-3" />}
        mainIcon={<LeadIcon className="w-12 h-12" />}
        rightIcon={<PipelineIcon className="w-4 h-4" />}
        heading="Sales Pipeline"
        placeholder="Search leads..."
      />

      {/* Pipeline status columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusColumns.map((col) => (
          <div
            key={col.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${col.bg}`}
          >
            <div className={`w-8 h-8 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center`}>
              <col.icon className={`w-4 h-4 ${col.color}`} />
            </div>
            <div>
              <p className="text-xs text-[#71717a]">{col.label}</p>
              <p className={`text-lg font-semibold ${col.color}`}>{col.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="rounded-lg border border-[#27272a] bg-[#18181b] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#27272a]">
          <h2 className="text-sm font-medium text-[#fafafa]">All Leads</h2>
          <p className="text-xs text-[#71717a] mt-0.5">Manage attendees and their progress through your pipeline.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-[#27272a] hover:bg-transparent">
              <TableHead className="text-xs text-[#71717a] font-medium uppercase tracking-wide">Name</TableHead>
              <TableHead className="text-xs text-[#71717a] font-medium uppercase tracking-wide">Email</TableHead>
              <TableHead className="text-xs text-[#71717a] font-medium uppercase tracking-wide">Webinar</TableHead>
              <TableHead className="text-right text-xs text-[#71717a] font-medium uppercase tracking-wide">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead) => (
              <TableRow key={lead.id} className="border-[#27272a] hover:bg-[#1c1c1f] transition-colors">
                <TableCell className="font-medium text-sm text-[#fafafa]">{lead.user.name}</TableCell>
                <TableCell className="text-sm text-[#a1a1aa]">{lead.user.email}</TableCell>
                <TableCell className="text-sm text-[#a1a1aa]">
                  <span className="flex items-center gap-1.5 line-clamp-1">
                    <Video className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    {lead.webinar.title}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className="border-[#3f3f46] text-[#a1a1aa] text-xs"
                  >
                    {lead.attendedType}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {!leads || leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-sm text-[#71717a]">
                  No leads found. Start a webinar to gather attendees!
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
