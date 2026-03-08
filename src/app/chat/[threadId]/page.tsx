"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RenderMessages from "@/components/RenderMessages";
import ChatBox from "@/components/ChatBox";
import { RootState, AppDispatch } from "@/store/store";
import { sendMessage, fetchMessages, chatActions } from "@/store/chatSlice";
import TopNav from "@/components/TopNav";
import { PAGE } from "@/lib/constants";

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { threadId } = useParams<{ threadId: string }>();
  const threadData = useSelector((state: RootState) => state.chat.threadData);
  const sendMessageLoading = useSelector((state: RootState) => state.chat.sendMessageLoading);
  const fetchMessagesLoading = useSelector((state: RootState) => state.chat.fetchMessagesLoading);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (threadId && threadData?.thread_id !== threadId) {
      dispatch(fetchMessages(threadId))
        .unwrap()
        .catch(() => router.replace("/"));
    }
  }, [threadId]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessageLoading || !threadData) return;
    setInput("");
    const tempMsgId = crypto.randomUUID();
    dispatch(chatActions.addMessage({ id: tempMsgId, role: "user", content: trimmed, timestamp: Date.now() }));
    dispatch(sendMessage({ threadId: threadData.thread_id, message: trimmed, tempMsgId }));
  };

  if (fetchMessagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#212121]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#212121]">
      <TopNav page={isSignedIn ? PAGE.CHAT : PAGE.UNAUTH_CHAT} />
      <div className="flex-1 overflow-y-auto">
        <RenderMessages />
      </div>
      <ChatBox value={input} onChange={setInput} onSubmit={handleSubmit} disabled={sendMessageLoading} />
    </div>
  );
}
