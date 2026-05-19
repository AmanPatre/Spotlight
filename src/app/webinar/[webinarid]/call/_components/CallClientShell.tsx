"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="size-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!attendeeId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black text-zinc-400">
        <Lock className="size-8 text-red-400" />
        <p className="text-sm">Redirecting…</p>
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
