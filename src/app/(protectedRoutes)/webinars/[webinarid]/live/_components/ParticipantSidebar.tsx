"use client";

import { useEffect, useState } from "react";
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

  const fetchParticipants = async () => {
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
  };

  useEffect(() => {
    fetchParticipants();
    // Poll every 10 seconds to keep it fresh
    const interval = setInterval(fetchParticipants, 10000);
    return () => clearInterval(interval);
  }, [webinarId]);

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Attendees</h3>
          <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {participants.length}
          </span>
        </div>
        <button
          onClick={fetchParticipants}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map((p) => (
            <div
              key={p.id}
              className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-default border border-transparent hover:border-white/5"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                  {p.name}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{p.email}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" title="Online" />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Users className="w-8 h-8 text-zinc-800 mb-2" />
            <p className="text-xs text-zinc-500">No attendees joined yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
