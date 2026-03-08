"use client";

import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import ChatBox from "@/components/ChatBox";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { AppDispatch } from "@/store/store";
import { createThread, sendMessage, chatActions } from "@/store/chatSlice";
import TopNav from "@/components/TopNav";
import { PAGE } from "@/lib/constants";
import { useViewportFix } from "@/hooks/useViewportFix";

export default function Home() {
  const containerRef = useViewportFix();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [input, setInput] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/home");
    }
  }, [isLoaded, isSignedIn]);

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

  if (isSignedIn) return null;

  return (
    <div ref={containerRef} className="fixed left-0 md:left-50 right-0 top-0 flex flex-col bg-[#212121]" style={{ height: '100dvh' }}>
      <TopNav page={PAGE.UNAUTH_HOME} />
      <div className="flex-1 flex flex-col items-center justify-center md:px-6">
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#19c37d]/20 border border-[#19c37d]/30 flex items-center justify-center mb-5">
            <SparklesIcon className="w-7 h-7 text-[#19c37d]" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            Start a conversation.
          </h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-6">
            I&apos;m here to assist you with anything you need.
          </p>
          <div className="w-full">
            <ChatBox
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
