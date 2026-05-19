"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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

type Props = {
  webinarId: string;
  webinarTitle: string;
  aiAgentId: string | null;
};

export default function LiveRoomClient({
  webinarId,
  webinarTitle,
  aiAgentId,
}: Props) {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
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
    if (!isLoaded || !clerkUser) return;
    if (initCalledRef.current) return; // already initializing or done
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
          name:
            clerkUser.fullName ??
            clerkUser.emailAddresses[0]?.emailAddress ??
            "Host",
          image: clerkUser.imageUrl,
        };

        const videoClient = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token: data.token,
        });

        // Store in ref so the cleanup can disconnect it even if state
        // hasn't updated yet (important for Strict Mode).
        clientRef.current = videoClient;

        const streamCall = videoClient.call("livestream", webinarId);
        await streamCall.getOrCreate({
          data: {
            custom: { title: webinarTitle },
          },
        });

        // Join the call so WebRTC is established and call state is synced
        await streamCall.join();

        setClient(videoClient);
        setCall(streamCall);
      } catch (err: any) {
        console.error("Stream init error:", err);
        setError(`Stream error: ${err.message || "Unknown error"}`);
        // Allow retry
        initCalledRef.current = false;
      }
    };

    initStream();

    // Warn on tab close/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving will end your live stream for all attendees. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup: disconnect on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clientRef.current?.disconnectUser();
      clientRef.current = null;
    };
  }, [isLoaded, clerkUser, webinarId, webinarTitle]);

  if (!isLoaded || (!client && !error)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm">Connecting to live stream...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => {
            setError(null);
            initCalledRef.current = false;
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
        >
          Retry
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
