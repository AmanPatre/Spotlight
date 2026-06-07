import { Badge } from "@/components/ui/badge";
import UserInfoCard from "@/components/ui/ReusableComponent/UserInfocard";
import { Attendee, CallDebrief } from "@prisma/client";
import React from "react";

type Props = {
  title: string;
  count: number;
  users: Attendee[];
  tags: string[];
  debriefs?: (CallDebrief & { attendance: { attendeeId: string } })[];
};

const PipelineLayout = ({ title, count, users, tags }: Props) => {
  return (
    <div className="flex-shrink-0 w-[350px] p-5 border border-zinc-800 bg-zinc-900/50 rounded-xl flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>{title}</h2>
        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 pointer-events-none hover:bg-zinc-800">{count}</Badge>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1 pb-4">
        {users.map((user, index) => {
          return <UserInfoCard key={user.id || index} customer={user} tags={tags} />;
        })}
      </div>
    </div>
  );
};

export default PipelineLayout;

