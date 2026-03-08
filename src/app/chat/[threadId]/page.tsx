"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RenderMessages from "@/components/RenderMessages";
import ChatBox from "@/components/ChatBox";
import { RootState, AppDispatch } from "@/store/store";
import { sendMessage, fetchMessages, chatActions } from "@/store/chatSlice";
import { setSignUp } from "@/store/modalSlice";
import TopNav from "@/components/TopNav";
import { PAGE } from "@/lib/constants";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { threadId } = useParams<{ threadId: string }>();
  const threadData = useSelector((state: RootState) => state.chat.threadData);
  const sendMessageLoading = useSelector((state: RootState) => state.chat.sendMessageLoading);
  const fetchMessagesLoading = useSelector((state: RootState) => state.chat.fetchMessagesLoading);
  const [input, setInput] = useState("");
  const userMessageCount = useSelector(
    (state: RootState) => state.chat.threadData?.messages.filter((m) => m.role === "user").length ?? 0
  );
  const showNudge = !isSignedIn && userMessageCount >= 2;

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
      <div className="flex h-dvh items-center justify-center bg-[#212121]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[#212121] overflow-hidden">
      <TopNav page={isSignedIn ? PAGE.CHAT : PAGE.UNAUTH_CHAT} />
      <div className="flex-1 overflow-y-auto">
        <RenderMessages />
      </div>
      {showNudge && (
        <div className="px-4 pt-2">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-[#2f2f2f] border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <SparklesIcon className="w-4 h-4 text-[#19c37d] shrink-0" />
              <p className="text-xs sm:text-sm text-white/70 truncate">
                Create a free account to save your chats and unlock more features.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => dispatch(setSignUp(true))}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#19c37d] hover:bg-[#17b371] text-white transition-all cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
      <ChatBox value={input} onChange={setInput} onSubmit={handleSubmit} disabled={sendMessageLoading} />
    </div>
  );
}
