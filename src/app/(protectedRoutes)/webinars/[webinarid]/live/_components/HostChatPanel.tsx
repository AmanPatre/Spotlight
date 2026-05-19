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
import { MessageSquare, Loader2 } from "lucide-react";

type Props = {
  webinarId: string;
  hostId: string;
  hostName: string;
};

export default function HostChatPanel({ webinarId, hostId, hostName }: Props) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/stream-token");
        const { token } = await res.json();

        const client = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY!
        );
        clientRef.current = client;

        await client.connectUser(
          { id: hostId, name: hostName },
          token
        );

        const ch = client.channel("livestream", webinarId, {});
        await ch.watch();

        setChatClient(client);
        setChannel(ch);
      } catch (err) {
        console.error("Chat init error", err);
        setError("Failed to connect to chat.");
      }
    };

    init();

    return () => {
      setChatClient(null);
      setChannel(null);
      const client = clientRef.current;
      if (client) {
        setTimeout(() => {
          client.disconnectUser();
        }, 1);
      }
    };
  }, [hostId, hostName, webinarId]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 text-sm p-4">
        {error}
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        <p className="text-xs">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-border overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <MessageSquare className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold text-primary">Live Chat</span>
      </div>

      {/* Stream Chat UI */}
      <div className="flex-1 overflow-hidden [&_.str-chat]:h-full [&_.str-chat__container]:h-full">
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
