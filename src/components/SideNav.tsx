"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/nextjs";
import { PencilSquareIcon, ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "@/store/store";
import { clearMessages, fetchThreads, clearAuth } from "@/store/chatSlice";
import { setDeleteThreadId } from "@/store/modalSlice";
import SeraLogo from "@/components/SeraLogo";

export default function SideNav() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const threadData = useSelector((state: RootState) => state.chat.threadData);
  const threads = useSelector((state: RootState) => state.chat.threads);
  const fetchThreadsLoading = useSelector((state: RootState) => state.chat.fetchThreadsLoading);

  useEffect(() => {
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) localStorage.setItem("authToken", token);
        dispatch(fetchThreads());
      });
    } else if (isSignedIn === false) {
      localStorage.removeItem("authToken");
      dispatch(clearAuth());
    }
  }, [isSignedIn]);

  const handleNewChat = () => {
    dispatch(clearMessages());
    router.push(isSignedIn ? "/home" : "/");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-50 bg-[#171717] border-r border-white/5 flex flex-col px-4 py-4 gap-4 z-50">
      {/* Logo */}
      <div className="px-1 py-1">
        <SeraLogo />
      </div>

      {/* New Chat */}
      {(threadData || isSignedIn) && (
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm transition-all cursor-pointer"
          title="New Chat"
        >
          <PencilSquareIcon className="w-4 h-4" />
          New Chat
        </button>
      )}

      {/* Thread list for auth users */}
      {isSignedIn && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          <p className="px-3 pb-1 text-xs font-medium text-white/25 uppercase tracking-wider">History</p>
          {fetchThreadsLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
            </div>
          ) : (
            threads.map((t) => (
              <div
                key={t.thread_id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  threadData?.thread_id === t.thread_id
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <button
                  onClick={() => router.push(`/chat/${t.thread_id}`)}
                  className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-left"
                >
                  <ChatBubbleLeftIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.title || "New Thread"}</span>
                </button>
                <button
                  onClick={() => dispatch(setDeleteThreadId(t.thread_id))}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all cursor-pointer"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
