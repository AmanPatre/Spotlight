import { Badge } from "@/components/ui/badge";
import UserInfoCard from "@/components/ui/ReusableComponent/UserInfocard";
import { Attendee, CallDebrief } from "@prisma/client";
import React from "react";
import LowTierToggle from "./LowTierToggle";

type Props = {
  title: string;
  count: number;
  users: Attendee[];
  tags: string[];
  debriefs?: (CallDebrief & { attendance: { attendeeId: string } })[];
};

const PipelineLayout = ({ title, count, users, tags, debriefs = [] }: Props) => {

  const getScore = (userId: string) => {
    return debriefs.find((d) => d.attendance.attendeeId === userId)?.score || 0;
  };

  // Sort users by score descending.
  const sortedUsers = [...users].sort((a, b) => getScore(b.id) - getScore(a.id));

  // Split into tiers
  const hotUsers = sortedUsers.filter(u => getScore(u.id) >= 8);
  const midUsers = sortedUsers.filter(u => getScore(u.id) >= 4 && getScore(u.id) < 8);
  const lowUsers = sortedUsers.filter(u => getScore(u.id) < 4); // Score 1-3, or 0 (no score)

  return (
    <div className="flex-shrink-0 w-[350px] p-5 border border-border bg-background/10 rounded-xl backdrop-blur-2xl flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1 pb-4">
        {/* Hot Tier */}
        {hotUsers.map((user, index) => {
          const debrief = debriefs.find((d) => d.attendance.attendeeId === user.id);
          return <UserInfoCard key={`hot-${index}`} customer={user} tags={tags} debrief={debrief} />;
        })}

        {/* Separator if both hot and mid exist */}
        {hotUsers.length > 0 && midUsers.length > 0 && (
          <div className="w-full flex items-center justify-center py-2 opacity-30">
            <div className="h-[1px] w-full bg-border" />
          </div>
        )}

        {/* Mid Tier */}
        {midUsers.map((user, index) => {
          const debrief = debriefs.find((d) => d.attendance.attendeeId === user.id);
          return <UserInfoCard key={`mid-${index}`} customer={user} tags={tags} debrief={debrief} />;
        })}

        {/* Low Tier (Archived/Hidden by default) */}
        <LowTierToggle count={lowUsers.length}>
          {lowUsers.map((user, index) => {
            const debrief = debriefs.find((d) => d.attendance.attendeeId === user.id);
            return <UserInfoCard key={`low-${index}`} customer={user} tags={tags} debrief={debrief} className="opacity-90 grayscale-[30%]" />;
          })}
        </LowTierToggle>
      </div>
    </div>
  );
};

export default PipelineLayout;
