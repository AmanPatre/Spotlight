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
    <div className="p-6 rounded border border-[#27272a] bg-[#141313] flex flex-col gap-5 shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#27272a] pb-3">
        <Monitor className="w-4 h-4 text-[#ffffff]" />
        <h3 className="text-[12px] font-bold text-[#ffffff] uppercase tracking-[0.2em]" style={{ fontFamily: 'Geist, sans-serif' }}>
          EXTERNAL INGRESS CONFIG
        </h3>
      </div>

      <p className="text-[10px] font-mono text-[#71717a] uppercase tracking-widest leading-relaxed">
        Map these credentials to OBS → Settings → Stream → Custom RTMP node
      </p>

      {/* RTMP URL */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono text-[#c4c7c8] uppercase tracking-[0.2em] block">
          RTMP SERVER ENDPOINT
        </label>
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#444748] rounded px-4 py-2.5 group hover:border-[#ffffff]/30 transition-colors">
          <span className="text-[11px] text-[#ffffff] font-mono flex-1 truncate tracking-tight">
            {rtmpUrl ?? (
              <span className="text-[#52525b] italic">
                Awaiting manual broadcast trigger...
              </span>
            )}
          </span>
          {rtmpUrl && (
            <button
              onClick={() => copyToClipboard(rtmpUrl, "rtmp")}
              className="text-[#71717a] hover:text-[#ffffff] transition-all flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stream Key */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono text-[#c4c7c8] uppercase tracking-[0.2em] block">
          ENCRYPTION TOKEN / KEY
        </label>
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#444748] rounded px-4 py-2.5 group hover:border-[#ffffff]/30 transition-colors">
          <span className="text-[11px] text-[#ffffff] font-mono flex-1 truncate tracking-tight">
            {streamKey
              ? copied === "key"
                ? streamKey
                : "•••• •••• •••• ••••"
              : (
                <span className="text-[#52525b] italic tracking-normal">
                  Not yet deployed
                </span>
              )}
          </span>
          {streamKey && (
            <button
              onClick={() => copyToClipboard(streamKey, "key")}
              className="text-[#71717a] hover:text-[#ffffff] transition-all flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
