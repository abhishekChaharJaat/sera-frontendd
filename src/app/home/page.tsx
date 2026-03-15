"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { AppDispatch } from "@/store/store";
import { createThread } from "@/store/threadSlice";
import { sendMessage, messageActions } from "@/store/messageSlice";
import TopNav from "@/components/TopNav";
import { PAGE } from "@/lib/constants";
import { useViewportFix } from "@/hooks/useViewportFix";

const SESSION_KEY = "thread_pending_message";

export default function HomePage() {
  const containerRef = useViewportFix();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [input, setInput] = useState("");
  const submitting = useRef(false);
  const [creating, setCreating] = useState(false);
  const [showColdStartMsg, setShowColdStartMsg] = useState(false);

  useEffect(() => {
    if (!creating) {
      setShowColdStartMsg(false);
      return;
    }
    const timer = setTimeout(() => setShowColdStartMsg(true), 15000);
    return () => clearTimeout(timer);
  }, [creating]);

  const startThread = useCallback(async (message: string) => {
    if (submitting.current) return;
    submitting.current = true;
    setCreating(true);

    const result = await dispatch(createThread());
    if (createThread.fulfilled.match(result)) {
      const { thread_id } = result.payload;
      const tempMsgId = crypto.randomUUID();
      dispatch(
        messageActions.addMessage({
          id: tempMsgId,
          role: "user",
          content: message,
          timestamp: Date.now(),
        }),
      );
      dispatch(sendMessage({ threadId: thread_id, message, tempMsgId, attachments: [] }));
      sessionStorage.removeItem(SESSION_KEY);
      router.push(`/chat/${thread_id}`);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      setCreating(false);
    }
    submitting.current = false;
  }, [dispatch, router]);

  // On mount: resume if a pending message survived a refresh
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      startThread(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (files: File[]) => {
    const trimmed = input.trim();
    if ((!trimmed && files.length === 0) || submitting.current) return;
    setInput("");

    if (files.length > 0) {
      // Files can't survive a refresh — handle inline without sessionStorage
      submitting.current = true;
      setCreating(true);
      const result = await dispatch(createThread());
      if (createThread.fulfilled.match(result)) {
        const { thread_id } = result.payload;
        const tempMsgId = crypto.randomUUID();
        const pendingAttachments = files.map((f) => ({
          filename: f.name,
          content_type: f.type,
          size: f.size,
          status: "pending" as const,
        }));
        dispatch(
          messageActions.addMessage({
            id: tempMsgId,
            role: "user",
            content: trimmed,
            timestamp: Date.now(),
            attachments: pendingAttachments,
          }),
        );
        dispatch(sendMessage({ threadId: thread_id, message: trimmed, tempMsgId, attachments: files }));
        router.push(`/chat/${thread_id}`);
      } else {
        setCreating(false);
      }
      submitting.current = false;
    } else {
      sessionStorage.setItem(SESSION_KEY, trimmed);
      startThread(trimmed);
    }
  };

  if (creating) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#212121]">
        <div className="w-7 h-7 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Starting conversation…</p>
        {showColdStartMsg && (
          <p className="text-white/30 text-xs max-w-xs text-center leading-relaxed">
            The server runs on a free tier — cold starts can take 40–45 seconds. Hang tight!
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed left-0 md:left-50 right-0 top-0 flex flex-col bg-[#212121]" style={{ height: '100dvh' }}>
      <TopNav page={PAGE.HOME} />
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
