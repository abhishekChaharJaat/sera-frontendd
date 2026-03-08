"use client";

import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { AppDispatch } from "@/store/store";
import { createThread, sendMessage, chatActions } from "@/store/chatSlice";
import TopNav from "@/components/TopNav";
import { PAGE } from "@/lib/constants";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [input, setInput] = useState("");
  const submitting = useRef(false);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || submitting.current) return;
    submitting.current = true;
    setInput("");

    const result = await dispatch(createThread());
    if (createThread.fulfilled.match(result) && trimmed.length > 0) {
      const { thread_id } = result.payload;
      const tempMsgId = crypto.randomUUID();
      dispatch(
        chatActions.addMessage({
          id: tempMsgId,
          role: "user",
          content: trimmed,
          timestamp: Date.now(),
        }),
      );
      dispatch(
        sendMessage({ threadId: thread_id, message: trimmed, tempMsgId }),
      );
      router.push(`/chat/${thread_id}`);
    }
    submitting.current = false;
  };

  return (
    <div className="flex flex-col h-screen bg-[#212121]">
      <TopNav page={PAGE.HOME} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-16">
        <div className="w-14 h-14 rounded-full bg-[#19c37d]/20 border border-[#19c37d]/30 flex items-center justify-center mb-6">
          <SparklesIcon className="w-7 h-7 text-[#19c37d]" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          How can I help you today?
        </h1>
        <p className="text-white/40 text-sm max-w-md">
          Start a conversation. I&apos;m here to assist you with anything you
          need.
        </p>
      </div>

      <ChatBox
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={false}
      />
    </div>
  );
}
