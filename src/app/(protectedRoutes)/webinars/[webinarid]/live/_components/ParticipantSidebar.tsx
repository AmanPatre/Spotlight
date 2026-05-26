"use client";

import { useEffect, useState, useCallback } from "react";
import { getWebinarAttendence } from "@/actions/attendence";
import { AttendedTypeEnum } from "@/generated/prisma/enums";
import { Users, Search, RefreshCw } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  email: string;
};

export default function ParticipantSidebar({ webinarId }: { webinarId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWebinarAttendence(webinarId, { inlcudeUsers: true });
      if (res.success && res.data) {
        // Flatten users from ATTENDED, ADDED_TO_CART, etc.
        const joinedUsers: Participant[] = [];
        const typesToInclude = [
          AttendedTypeEnum.ATTENDED,
          AttendedTypeEnum.ADDED_TO_CART,
          AttendedTypeEnum.BREAKOUT_ROOM
        ];

        typesToInclude.forEach(type => {
          if (res.data![type]?.users) {
            joinedUsers.push(...(res.data![type].users as Participant[]));
          }
        });

        // Unique by ID
        const uniqueUsers = Array.from(new Map(joinedUsers.map(u => [u.id, u])).values());
        setParticipants(uniqueUsers);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  }, [webinarId]);

  useEffect(() => {
    // Move initialization logic here
    void (async () => {
      await fetchParticipants();
    })();
    // Poll every 10 seconds to keep it fresh
    const interval = setInterval(fetchParticipants, 10000);
    return () => clearInterval(interval);
  }, [fetchParticipants, webinarId]);

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#141313] overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-[#444748] flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e9192]" />
          <input
            type="text"
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1c1b1b] border border-[#444748] rounded py-2 pl-9 pr-4 text-xs text-[#e5e2e1] font-mono placeholder:text-[#8e9192] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
          />
        </div>
        <button
          onClick={fetchParticipants}
          className="p-2 border border-[#444748] hover:bg-[#2a2a2a] rounded transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#c4c7c8] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map((p) => (
            <div
              key={p.id}
              className="group flex items-center gap-3 p-2.5 rounded hover:bg-[#2a2a2a] transition-all cursor-default border border-transparent hover:border-[#444748]"
            >
              <div className="w-8 h-8 rounded bg-[#1c1b1b] border border-[#444748] flex items-center justify-center text-[#c4c7c8] text-xs font-mono font-bold shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#e5e2e1] truncate transition-colors">
                  {p.name}
                </p>
                <p className="text-[10px] text-[#8e9192] font-mono truncate">{p.email}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" title="Online" />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Users className="w-8 h-8 text-[#444748] mb-2" />
            <p className="text-xs text-[#8e9192] font-mono">No attendees joined yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
