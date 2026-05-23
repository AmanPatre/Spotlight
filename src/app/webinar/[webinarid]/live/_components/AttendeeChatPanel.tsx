"use client";

import { useEffect, useRef, useState } from "react";
import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Window,
} from "stream-chat-react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import "stream-chat-react/dist/css/index.css";
import { Loader2 } from "lucide-react";

type Props = {
  webinarId: string;
  attendeeId: string;
  attendeeName: string;
};

export default function AttendeeChatPanel({ webinarId, attendeeId, attendeeName }: Props) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/attendee-stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendeeId }),
        });
        const { token } = await res.json();

        const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
        clientRef.current = client;

        await client.connectUser({ id: attendeeId, name: attendeeName }, token);

        const ch = client.channel("livestream", webinarId, {});
        await ch.watch();

        setChatClient(client);
        setChannel(ch);
      } catch (err) {
        console.error("Attendee chat init error", err);
        setError("Failed to connect to chat.");
      }
    };

    init();

    return () => {
      setChatClient(null);
      setChannel(null);
      const client = clientRef.current;
      if (client) {
        setTimeout(() => { client.disconnectUser(); }, 1);
      }
    };
  }, [attendeeId, attendeeName, webinarId]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="font-mono text-[11px] text-[#ffb4ab] text-center">{error}</p>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
        <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-widest">Connecting to chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="flex-1 overflow-hidden [&_.str-chat]:h-full [&_.str-chat__container]:h-full [&_.str-chat]:!bg-zinc-950 [&_.str-chat__main-panel]:!bg-zinc-950 [&_.str-chat__list]:!bg-zinc-950 [&_.str-chat__message-input]:!bg-zinc-900 [&_.str-chat__message-input]:!border-t [&_.str-chat__message-input]:!border-zinc-800">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageComposer />
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  );
}
