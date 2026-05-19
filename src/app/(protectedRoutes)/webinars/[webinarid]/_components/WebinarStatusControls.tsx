"use client";

import { updateWebinarStatus } from "@/actions/webinar";
import { WebinarStatusEnum } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Radio, Square, Users } from "lucide-react";

type Props = {
  webinarId: string;
  currentStatus: WebinarStatusEnum;
};

const WebinarStatusControls = ({ webinarId, currentStatus }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: WebinarStatusEnum) => {
    setLoading(true);
    try {
      const result = await updateWebinarStatus(webinarId, newStatus);
      if (result.status === 200) {
        toast.success(result.message);
        if (newStatus === WebinarStatusEnum.LIVE) {
          window.open(`/webinars/${webinarId}/live`, "_blank");
          router.refresh(); // Still refresh the current page to update status buttons
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === WebinarStatusEnum.ENDED) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
        <Square className="w-4 h-4" />
        Webinar Ended
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {currentStatus === WebinarStatusEnum.SCHEDULED && (
        <button
          onClick={() => handleStatusChange(WebinarStatusEnum.WAITING_ROOM)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-primary border border-border text-sm font-medium hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Users className="w-4 h-4" />
          )}
          Open Waiting Room
        </button>
      )}

      {currentStatus === WebinarStatusEnum.WAITING_ROOM && (
        <button
          onClick={() => handleStatusChange(WebinarStatusEnum.LIVE)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Radio className="w-4 h-4" />
          )}
          Go Live
        </button>
      )}

      {currentStatus === WebinarStatusEnum.LIVE && (
        <>
          <button
            onClick={() => window.open(`/webinars/${webinarId}/live`, "_blank")}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Radio className="w-4 h-4" />
            Resume Live Stream
          </button>
          <button
            onClick={() => handleStatusChange(WebinarStatusEnum.ENDED)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            End Webinar
          </button>
        </>
      )}
    </div>
  );
};

export default WebinarStatusControls;
