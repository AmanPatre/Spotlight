"use client";

import { useEffect, useState, useRef } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import HostStreamView from "./HostStreamView";
import { CtaTypeEnum } from "@prisma/client";

type Props = {
  webinarId: string;
  webinarTitle: string;
  aiAgentId: string | null;
  ctaType: CtaTypeEnum;
};

export default function LiveRoomClient({
  webinarId,
  webinarTitle,
  aiAgentId,
  ctaType,
}: Props) {
  const { user: clerkUser, isLoaded } = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<
    StreamVideoClient["call"]
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a ref so we never create more than one client regardless of
  // how many times React runs the effect (Strict Mode / hot-reload).
  const initCalledRef = useRef(false);
  const clientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!isLoaded || !clerkUser || initCalledRef.current) return;
    initCalledRef.current = true;

    const initStream = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        if (!apiKey) throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not defined");

        const res = await fetch("/api/stream-token");
        const data = await res.json();
        if (!res.ok || !data.token) {
          throw new Error(data.error || "Failed to get stream token");
        }

        const streamUser: User = {
          id: clerkUser.id,
          name: clerkUser.fullName ?? clerkUser.emailAddresses[0]?.emailAddress ?? "Host",
          image: clerkUser.imageUrl,
        };

        const videoClient = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token: data.token,
        });

        clientRef.current = videoClient;

        const streamCall = videoClient.call("livestream", webinarId);
        await streamCall.getOrCreate({
          data: {
            custom: { title: webinarTitle },
          },
        });

        await streamCall.join();

        setClient(videoClient);
        setCall(streamCall);
      } catch (err) {
        const error = err as Error;
        console.error("Stream init error:", error);
        setError(`Stream error: ${error.message || "Unknown error"}`);
        initCalledRef.current = false;
      }
    };

    initStream();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving will end your live stream for all attendees. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
        initCalledRef.current = false;
      }
    };
  }, [isLoaded, clerkUser, webinarId, webinarTitle]);

  if (!isLoaded || (!client && !error)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-[#a1a1aa] bg-[#141313]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ffffff]" />
        <p className="text-[12px] font-mono uppercase tracking-[0.2em]">Synchronising broadcast nodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-[#141313]">
        <p className="text-red-500 text-[12px] font-mono uppercase tracking-widest">{error}</p>
        <button
          onClick={() => {
            setError(null);
            initCalledRef.current = false;
          }}
          className="px-8 py-3 bg-[#ffffff] text-[#141313] rounded-none text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#c6c6c7] transition-all"
        >
          RE-INITIALISE
        </button>
      </div>
    );
  }

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <HostStreamView
          webinarId={webinarId}
          aiAgentId={aiAgentId}
          ctaType={ctaType}
          hostId={clerkUser!.id}
          hostName={
            clerkUser!.fullName ??
            clerkUser!.emailAddresses[0]?.emailAddress ??
            "Host"
          }
        />
      </StreamCall>
    </StreamVideo>
  );
}
