"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { RootState, AppDispatch } from "@/store/store";
import { createThread, sendMessage } from "@/store/chatSlice";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const threadCreationLoading = useSelector(
    (state: RootState) => state.chat.threadCreationLoading,
  );
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || threadCreationLoading) return;
    setInput("");

    const result = await dispatch(createThread());
    if (createThread.fulfilled.match(result)) {
      const { thread_id } = result.payload;
      dispatch(sendMessage({ threadId: thread_id, message: trimmed }));
      router.push(`/chat/${thread_id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#212121]">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-16">
        {threadCreationLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Starting conversation…</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[#19c37d]/20 border border-[#19c37d]/30 flex items-center justify-center mb-6">
              <SparklesIcon className="w-7 h-7 text-[#19c37d]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              How can I help you today?
            </h1>
            <p className="text-white/40 text-sm max-w-md">
              Start a conversation. I&apos;m here to assist you with anything
              you need.
            </p>
          </>
        )}
      </div>

      <ChatBox
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={threadCreationLoading}
      />
    </div>
  );
}
