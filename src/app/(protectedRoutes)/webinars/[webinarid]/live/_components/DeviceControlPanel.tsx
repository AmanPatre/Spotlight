"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";

export default function DeviceControlPanel() {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const { microphone, isMute: isMicMuted, devices: micDevices, selectedDevice: selectedMic } = useMicrophoneState();
  const { camera, isMute: isCamOff, devices: camDevices, selectedDevice: selectedCam } = useCameraState();

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
    <div className="p-6 rounded border border-[#27272a] bg-[#141313] flex flex-col gap-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#27272a] pb-3">
        <Monitor className="w-4 h-4 text-[#ffffff]" />
        <h3 className="text-[12px] font-bold text-[#ffffff] uppercase tracking-[0.2em]" style={{ fontFamily: 'Geist, sans-serif' }}>
          Hardware Configuration
        </h3>
      </div>

      <div className="space-y-5">
        {/* Mic Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c4c7c8] flex items-center gap-2">
            <Mic className="w-3 h-3" /> Input Source
          </label>
          <select
            value={selectedMic}
            onChange={(e) => microphone.select(e.target.value)}
            className="w-full bg-[#1c1b1b] border border-[#444748] rounded px-4 py-2.5 text-[12px] text-[#ffffff] font-mono focus:outline-none focus:ring-1 focus:ring-[#ffffff] transition-all"
          >
            {micDevices?.map((device) => (
              <option key={device.deviceId} value={device.deviceId} className="bg-[#141313]">
                {device.label || `NODE-MIC-${device.deviceId.slice(0, 5).toUpperCase()}`}
              </option>
            ))}
          </select>
        </div>

        {/* Cam Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c4c7c8] flex items-center gap-2">
            <Video className="w-3 h-3" /> Optic Matrix
          </label>
          <select
            value={selectedCam}
            onChange={(e) => camera.select(e.target.value)}
            className="w-full bg-[#1c1b1b] border border-[#444748] rounded px-4 py-2.5 text-[12px] text-[#ffffff] font-mono focus:outline-none focus:ring-1 focus:ring-[#ffffff] transition-all"
          >
            {camDevices?.map((device) => (
              <option key={device.deviceId} value={device.deviceId} className="bg-[#141313]">
                {device.label || `NODE-CAM-${device.deviceId.slice(0, 5).toUpperCase()}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-px bg-[#444748]/30 my-2" />

      {/* Toggles */}
      <div className="flex items-center gap-4">
        {/* Microphone toggle */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2.5 flex-1 justify-center px-4 py-3 rounded-none text-[11px] font-bold uppercase tracking-[0.1em] transition-all border shadow-sm ${isMicMuted
            ? "bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20"
            : "bg-[#ffffff] border-[#ffffff] text-[#141313] hover:bg-[#c6c6c7]"
            }`}
        >
          {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {isMicMuted ? "AUIDO IN OFF" : "AUDIO IN ON"}
        </button>

        {/* Camera toggle */}
        <button
          onClick={toggleCam}
          className={`flex items-center gap-2.5 flex-1 justify-center px-4 py-3 rounded-none text-[11px] font-bold uppercase tracking-[0.1em] transition-all border shadow-sm ${isCamOff
            ? "bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20"
            : "bg-[#ffffff] border-[#ffffff] text-[#141313] hover:bg-[#c6c6c7]"
            }`}
        >
          {isCamOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
          {isCamOff ? "OPTIC OFF" : "OPTIC ON"}
        </button>
      </div>
    </div>
  );
}
