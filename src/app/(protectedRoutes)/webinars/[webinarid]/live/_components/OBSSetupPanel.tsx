"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Copy, Monitor } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function OBSSetupPanel({ call }: { call: any }) {
  const [copied, setCopied] = useState<"rtmp" | "key" | null>(null);

  // Stream Video SDK embeds the stream key inside the RTMP address.
  // Full address: rtmps://ingress.stream-io-video.com:443/{stream_key}
  const fullRtmpAddress =
    call?.state?.ingress?.rtmp?.address ??
    call?.ingress?.rtmp?.address ??
    null;

  // Try the explicit stream_key field first, then parse from the URL
  const explicitKey =
    call?.state?.ingress?.rtmp?.stream_key ??
    call?.ingress?.rtmp?.stream_key ??
    null;

  const lastSlash = fullRtmpAddress?.lastIndexOf("/") ?? -1;
  const rtmpUrl =
    lastSlash > 0
      ? fullRtmpAddress!.substring(0, lastSlash)
      : fullRtmpAddress;
  const streamKey =
    explicitKey ??
    (lastSlash > 0 ? fullRtmpAddress!.substring(lastSlash + 1) : null);


  const copyToClipboard = async (text: string, type: "rtmp" | "key") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type === "rtmp" ? "RTMP URL" : "Stream Key"} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-primary">
          OBS / Streaming Software Setup
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Use these credentials in OBS → Settings → Stream → Custom RTMP
      </p>

      {/* RTMP URL */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">
          RTMP Server URL
        </label>
        <div className="flex items-center gap-2 bg-zinc-900 border border-border rounded-lg px-3 py-2">
          <span className="text-xs text-primary font-mono flex-1 truncate">
            {rtmpUrl ?? (
              <span className="text-muted-foreground italic">
                Click &quot;Go Live&quot; first to generate URL
              </span>
            )}
          </span>
          {rtmpUrl && (
            <button
              onClick={() => copyToClipboard(rtmpUrl, "rtmp")}
              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stream Key */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">
          Stream Key
        </label>
        <div className="flex items-center gap-2 bg-zinc-900 border border-border rounded-lg px-3 py-2">
          <span className="text-xs text-primary font-mono flex-1 truncate">
            {streamKey
              ? copied === "key"
                ? streamKey
                : "••••••••••••••••••••"
              : (
                <span className="text-muted-foreground italic">
                  Not yet available
                </span>
              )}
          </span>
          {streamKey && (
            <button
              onClick={() => copyToClipboard(streamKey, "key")}
              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
