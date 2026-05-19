"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import AttendeeStreamView from "./AttendeeStreamView";

type Props = {
  webinarId: string;
  webinarTitle: string;
  aiAgentId: string | null;
};

export default function AttendeeLiveClient({
  webinarId,
  webinarTitle,
  aiAgentId,
}: Props) {
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState<string>("Attendee");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem(`spotlight_attendee_${webinarId}`);
    const storedName = localStorage.getItem(
      `spotlight_attendee_name_${webinarId}`
    );

    if (!storedId) {
      // Not registered → bounce to landing page
      router.replace(`/webinar/${webinarId}`);
    } else {
      setAttendeeId(storedId);
      if (storedName) setAttendeeName(storedName);
    }
    setLoading(false);
  }, [webinarId, router]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!attendeeId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
        <Lock className="w-8 h-8 text-red-400" />
        <p className="text-sm text-muted-foreground">
          Redirecting to registration...
        </p>
      </div>
    );
  }

  return (
    <AttendeeStreamView
      webinarId={webinarId}
      attendeeId={attendeeId}
      attendeeName={attendeeName}
      aiAgentId={aiAgentId}
    />
  );
}
