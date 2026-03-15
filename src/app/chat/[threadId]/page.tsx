"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RenderMessages from "@/components/RenderMessages";
import ChatBox from "@/components/ChatBox";
import { RootState, AppDispatch } from "@/store/store";
import { sendMessage, fetchMessages, messageActions } from "@/store/messageSlice";
import TopNav from "@/components/TopNav";
import { PAGE } from "@/lib/constants";
import { useViewportFix } from "@/hooks/useViewportFix";

export default function ChatPage() {
  const containerRef = useViewportFix();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { threadId } = useParams<{ threadId: string }>();
  const threadData = useSelector((state: RootState) => state.messages.threadData);
  const sendMessageLoading = useSelector((state: RootState) => state.messages.sendMessageLoading);
  const fetchMessagesLoading = useSelector((state: RootState) => state.messages.fetchMessagesLoading);
  const [input, setInput] = useState("");
  useEffect(() => {
    if (threadId && threadData?.thread_id !== threadId) {
      dispatch(fetchMessages(threadId))
        .unwrap()
        .catch(() => router.replace("/"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, threadData?.thread_id]);

  const handleSubmit = (files: File[]) => {
    const trimmed = input.trim();
    if ((!trimmed && files.length === 0) || sendMessageLoading || !threadData) return;
    setInput("");
    const tempMsgId = crypto.randomUUID();
    const pendingAttachments = files.map((f) => ({
      filename: f.name,
      content_type: f.type,
      size: f.size,
      status: "pending" as const,
    }));
    dispatch(messageActions.addMessage({
      id: tempMsgId,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    }));
    dispatch(sendMessage({ threadId: threadData.thread_id, message: trimmed, tempMsgId, attachments: files }));
  };

  if (fetchMessagesLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#212121]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed left-0 md:left-50 right-0 top-0 flex flex-col bg-[#212121]" style={{ height: '100dvh' }}>
      <TopNav page={isSignedIn ? PAGE.CHAT : PAGE.UNAUTH_CHAT} />
      <div className="flex-1 overflow-y-auto">
        <RenderMessages />
      </div>
<ChatBox value={input} onChange={setInput} onSubmit={handleSubmit} disabled={sendMessageLoading} />
    </div>
  );
}
