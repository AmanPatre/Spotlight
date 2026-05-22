"use client";

import { useEffect, useState } from "react";
import { getWebinarStatus } from "@/actions/webinar";
import { WebinarStatusEnum } from "@/generated/prisma/enums";
import { Loader2, Timer, Bell, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  webinarId: string;
  webinarTitle: string;
  startTime: Date;
  onLive: () => void;
};

export default function WaitingRoom({
  webinarId,
  webinarTitle,
  startTime,
  onLive,
}: Props) {
  const [status, setStatus] = useState<WebinarStatusEnum>(
    WebinarStatusEnum.WAITING_ROOM
  );
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Polling interval for status updates
    const interval = setInterval(async () => {
      const currentStatus = await getWebinarStatus(webinarId);
      if (currentStatus) {
        setStatus(currentStatus as WebinarStatusEnum);
        if (currentStatus === WebinarStatusEnum.LIVE) {
          clearInterval(interval);
          // Add a small 2s delay to ensure host's Stream.io call is initialized
          setTimeout(() => {
            onLive();
          }, 2000);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [webinarId, onLive]);

  const handleNotifyMe = () => {
    setSubscribed(true);
    toast.success("We'll alert you as soon as we go live!");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-xl mx-auto text-center py-12 px-6 rounded-3xl border border-border bg-secondary/10 backdrop-blur-sm">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse" />
        <div className="relative w-24 h-24 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          You&apos;re on the list!
        </h2>
        <p className="text-muted-foreground">
          The host is getting everything ready for <strong>{webinarTitle}</strong>.
          We&apos;ll automatically redirect you when the broadcast begins.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Timer className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Starts At
            </p>
            <p className="text-sm font-semibold">
              {new Date(startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <button
          onClick={handleNotifyMe}
          disabled={subscribed}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${subscribed
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-secondary/30 border-border hover:bg-secondary/50 text-primary"
            }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${subscribed ? "bg-green-500/10" : "bg-purple-500/10 text-purple-400"
              }`}
          >
            {subscribed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Alerts
            </p>
            <p className="text-sm font-semibold">
              {subscribed ? "Subscribed" : "Notify Me"}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 px-4 rounded-full bg-secondary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        {status === WebinarStatusEnum.WAITING_ROOM
          ? "Waiting room is open"
          : "Host is preparing"}
      </div>
    </div>
  );
}
