"use client";

import { updateWebinarStatus } from "@/actions/webinar";
import { WebinarStatusEnum } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Radio, CircleStop, Users, CalendarIcon, Clock, XCircle, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { rescheduleWebinar } from "@/actions/webinar";
import { cn } from "@/lib/utils";

type Props = {
  webinarId: string;
  currentStatus: WebinarStatusEnum;
};

const WebinarStatusControls = ({ webinarId, currentStatus }: Props) => {
  const [loading, setLoading] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const router = useRouter();

  const handleStatusChange = async (newStatus: WebinarStatusEnum) => {
    setLoading(true);
    try {
      const result = await updateWebinarStatus(webinarId, newStatus);
      if (result.status === 200) {
        toast.success(result.message);
        if (newStatus === WebinarStatusEnum.LIVE) {
          window.open(`/webinars/${webinarId}/live`, "_blank");
          router.refresh();
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

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error("Please select both date and time");
      return;
    }
    setLoading(true);
    try {
      const result = await rescheduleWebinar(webinarId, rescheduleDate, rescheduleTime);
      if (result.status === 200) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to reschedule webinar");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === WebinarStatusEnum.ENDED) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded border border-[#27272a] bg-[#18181b] text-[#c4c7c8] text-sm font-medium opacity-70 cursor-not-allowed">
        <CircleStop className="w-4 h-4" />
        Webinar Ended
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {currentStatus === WebinarStatusEnum.SCHEDULED && (
        <div className="flex items-center gap-2">
          {/* Management Group */}
          <div className="flex items-center rounded-lg border border-[#27272a] bg-[#09090b] overflow-hidden">
            <Popover>
              <PopoverTrigger
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-[#18181b] transition-all disabled:opacity-50 border-r border-[#27272a]"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Reschedule</span>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#09090b] border-[#27272a] p-5 space-y-5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] text-white rounded-xl backdrop-blur-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Pick New Date</Label>
                    {rescheduleDate && <span className="text-[10px] text-zinc-400 font-mono">{format(rescheduleDate, "MMM dd, yyyy")}</span>}
                  </div>
                  <div className="border border-[#27272a] rounded-lg p-1 bg-black/20">
                    <Calendar
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">New Time (24h IST)</Label>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <Input
                      type="text"
                      placeholder="20:00"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="pl-10 bg-black/40 border-[#27272a] h-11 rounded-lg focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleReschedule}
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-11 font-semibold rounded-lg shadow-lg hover:shadow-white/5 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm New Schedule"}
                </Button>
              </PopoverContent>
            </Popover>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel this webinar? This cannot be undone.")) {
                  handleStatusChange(WebinarStatusEnum.CANCELLED);
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Cancel</span>
            </button>
          </div>

          <div className="w-px h-8 bg-[#27272a] mx-2" />

          <button
            onClick={() => handleStatusChange(WebinarStatusEnum.WAITING_ROOM)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            Open Waiting Room
          </button>
        </div>
      )}

      {currentStatus === WebinarStatusEnum.WAITING_ROOM && (
        <button
          onClick={() => handleStatusChange(WebinarStatusEnum.LIVE)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center gap-2 px-4 py-2 rounded border border-[#27272a] bg-[#18181b] text-white text-sm font-medium hover:bg-[#1c1b1b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Radio className="w-4 h-4" />
            Resume Live
          </button>
          <button
            onClick={() => handleStatusChange(WebinarStatusEnum.ENDED)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CircleStop className="w-4 h-4" />
            )}
            End Webinar
          </button>
        </>
      )}
    </div>
  );
};

export default WebinarStatusControls;
