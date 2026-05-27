"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import AttendeeStreamView from "./AttendeeStreamView";
import EngagementTracker from "./EngagementTracker";
import { getAttendeeStatus } from "@/actions/attendence";
import { AttendedTypeEnum } from "@prisma/client";

export default function AttendeeLiveClient({
  webinarId,
  aiAgentId,
}: {
  webinarId: string;
  aiAgentId: string | null;
}) {
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState<string>("Attendee");
  const [initialStatus, setInitialStatus] = useState<AttendedTypeEnum | null>(null);
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
      setTimeout(() => {
        if (storedId !== attendeeId) setAttendeeId(storedId);
        if (storedName && storedName !== attendeeName) setAttendeeName(storedName);
      }, 0);

      // Fetch current status
      getAttendeeStatus(webinarId, storedId)
        .then((res) => {
          if (res.success && res.attendedType) {
            setInitialStatus(res.attendedType as AttendedTypeEnum);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [webinarId, router, attendeeId, attendeeName]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black"
        style={{ backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">Initializing session...</p>
      </div>
    );
  }

  if (!attendeeId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black text-white">
        <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center">
          <Lock className="w-5 h-5 text-zinc-500" />
        </div>
        <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
          Redirecting to registration...
        </p>
      </div>
    );
  }

  return (
    <>
      <EngagementTracker webinarId={webinarId} attendeeId={attendeeId} />
      <AttendeeStreamView
        webinarId={webinarId}
        attendeeId={attendeeId}
        attendeeName={attendeeName}
        aiAgentId={aiAgentId}
        initialStatus={initialStatus}
      />
    </>
  );
}
