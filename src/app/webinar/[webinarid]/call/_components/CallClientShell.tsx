"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import VapiCallRoom from "./VapiCallRoom";

type Props = {
  webinarId: string;
  assistantId: string;
};

export default function CallClientShell({ webinarId, assistantId }: Props) {
  const router = useRouter();
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState("Guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem(`spotlight_attendee_${webinarId}`);
    const name = localStorage.getItem(`spotlight_attendee_name_${webinarId}`);
    if (!id) {
      router.replace(`/webinar/${webinarId}`);
      return;
    }
    setAttendeeId(id);
    if (name) setAttendeeName(name);
    setLoading(false);
  }, [router, webinarId]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-black"
        style={{
          backgroundImage: "radial-gradient(#444748 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="font-mono text-[11px] text-[#8e9192] uppercase tracking-widest">
            Initializing session…
          </p>
        </div>
      </div>
    );
  }

  if (!attendeeId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-[#8e9192]">
        <div className="w-10 h-10 border border-[#ffb4ab] flex items-center justify-center">
          <span className="text-[#ffb4ab] font-mono text-lg">!</span>
        </div>
        <p className="font-mono text-sm text-[#8e9192]">Redirecting…</p>
      </div>
    );
  }

  return (
    <VapiCallRoom
      webinarId={webinarId}
      assistantId={assistantId}
      attendeeName={attendeeName}
      attendeeId={attendeeId}
    />
  );
}
