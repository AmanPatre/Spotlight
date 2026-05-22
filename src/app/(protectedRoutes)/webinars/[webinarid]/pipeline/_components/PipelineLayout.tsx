import { Badge } from "@/components/ui/badge";
import UserInfoCard from "@/components/ui/ReusableComponent/UserInfocard";
import { Attendee, CallDebrief } from "@/generated/prisma/client";
import React from "react";

type Props = {
  title: string;
  count: number;
  users: Attendee[];
  tags: string[];
  debriefs?: (CallDebrief & { attendance: { attendeeId: string } })[];
};

const PipelineLayout = ({ title, count, users, tags, debriefs = [] }: Props) => {

  // Sort users: Hot Leads (score >= 8) at the top, then by score descending.
  const sortedUsers = [...users].sort((a, b) => {
    const scoreA = debriefs.find((d) => d.attendance.attendeeId === a.id)?.score || 0;
    const scoreB = debriefs.find((d) => d.attendance.attendeeId === b.id)?.score || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="flex-shrink-0 w-[350px] p-5 border border-border bg-background/10 rounded-xl backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
        {sortedUsers.map((user, index) => {
          const debrief = debriefs.find((d) => d.attendance.attendeeId === user.id);
          return (
            <UserInfoCard
              key={index}
              customer={user}
              tags={tags}
              debrief={debrief}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PipelineLayout;
