"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";

export default function DeviceControlPanel() {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamOff } = useCameraState();

  const toggleMic = async () => {
    if (isMicMuted) {
      await microphone.enable();
    } else {
      await microphone.disable();
    }
  };

  const toggleCam = async () => {
    if (isCamOff) {
      await camera.enable();
    } else {
      await camera.disable();
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-primary">
          Browser Device Controls
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Your camera and microphone are shared directly from your browser — no
        external software needed.
      </p>

      {/* Toggles */}
      <div className="flex items-center gap-3">
        {/* Microphone toggle */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
            isMicMuted
              ? "bg-red-600/20 border-red-600/40 text-red-400 hover:bg-red-600/30"
              : "bg-green-600/20 border-green-600/40 text-green-400 hover:bg-green-600/30"
          }`}
        >
          {isMicMuted ? (
            <>
              <MicOff className="w-4 h-4" />
              Mic Off
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Mic On
            </>
          )}
        </button>

        {/* Camera toggle */}
        <button
          onClick={toggleCam}
          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
            isCamOff
              ? "bg-red-600/20 border-red-600/40 text-red-400 hover:bg-red-600/30"
              : "bg-green-600/20 border-green-600/40 text-green-400 hover:bg-green-600/30"
          }`}
        >
          {isCamOff ? (
            <>
              <VideoOff className="w-4 h-4" />
              Camera Off
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Camera On
            </>
          )}
        </button>
      </div>

      {/* Status hint */}
      <p className="text-xs text-muted-foreground text-center">
        Allow camera/microphone access in your browser when prompted.
      </p>
    </div>
  );
}
