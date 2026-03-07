"use client";

import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import MessageBubble from "@/components/MessageBubble";
import ThinkingBubble from "@/components/ThinkingBubble";

export default function RenderMessages() {
  const messages = useSelector((state: RootState) => state.chat.threadData?.messages ?? []);
  const sendMessageLoading = useSelector((state: RootState) => state.chat.sendMessageLoading);
  const isStreaming = useSelector((state: RootState) => state.chat.isStreaming);
  const sendMessageError = useSelector((state: RootState) => state.chat.sendMessageError);
  const lastUserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastUserRef.current) {
      lastUserRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages, sendMessageLoading]);

  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");

  return (
    <div className="py-4 space-y-1 max-w-3xl mx-auto w-full">
      {messages.map((msg, i) => (
        <div key={msg.id} ref={i === lastUserIndex ? lastUserRef : undefined}>
          <MessageBubble message={msg} />
        </div>
      ))}
      {sendMessageLoading && !isStreaming && <ThinkingBubble />}
      {sendMessageError && (
        <div className="flex justify-center px-4 py-2">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg max-w-md text-center">
            {sendMessageError}
          </div>
        </div>
      )}
    </div>
  );
}
