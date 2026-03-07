"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import RenderMessages from "@/components/RenderMessages";
import ChatBox from "@/components/ChatBox";
import { RootState, AppDispatch } from "@/store/store";
import { sendMessage, fetchMessages } from "@/store/chatSlice";
import TopNav from "@/components/TopNav";

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>();
  const threadData = useSelector((state: RootState) => state.chat.threadData);
  const sendMessageLoading = useSelector(
    (state: RootState) => state.chat.sendMessageLoading,
  );
  const fetchMessagesLoading = useSelector(
    (state: RootState) => state.chat.fetchMessagesLoading,
  );
  const [input, setInput] = useState("");

  // On mount or refresh — restore thread from API if Redux state is empty
  useEffect(() => {
    if (!threadData && threadId) {
      dispatch(fetchMessages(threadId))
        .unwrap()
        .catch(() => router.replace("/"));
    }
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessageLoading || !threadData) return;
    setInput("");
    dispatch(sendMessage({ threadId: threadData.thread_id, message: trimmed }));
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
      <TopNav />
      <div className="flex-1 overflow-y-auto">
        <RenderMessages />
      </div>

      <ChatBox
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={sendMessageLoading}
      />
    </div>
  );
}
