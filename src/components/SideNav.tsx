"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/nextjs";
import { PencilSquareIcon, ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "@/store/store";
import { fetchThreads, clearAuth } from "@/store/threadSlice";
import { clearMessages } from "@/store/messageSlice";
import { setDeleteThreadId, setSideNavOpen, setSignIn, setSignUp } from "@/store/modalSlice";
import SeraLogo from "@/components/SeraLogo";

export default function SideNav() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, getToken } = useAuth();
  const threadData = useSelector((state: RootState) => state.messages.threadData);
  const threads = useSelector((state: RootState) => state.threads.threads);
  const fetchThreadsLoading = useSelector((state: RootState) => state.threads.fetchThreadsLoading);
  const isSideNavOpen = useSelector((state: RootState) => state.modal.isSideNavOpen);

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

  // Close sidebar on mobile when route changes
  useEffect(() => {
    dispatch(setSideNavOpen(false));
  }, [pathname]);

  const handleNewChat = () => {
    dispatch(clearMessages());
    router.push(isSignedIn ? "/home" : "/");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isSideNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => dispatch(setSideNavOpen(false))}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-50 bg-[#171717] border-r border-white/5 flex flex-col px-4 py-4 gap-4 z-50 transition-transform duration-300 ease-in-out
          md:translate-x-0 ${isSideNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
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
              <div className="flex flex-col gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                    <div className="w-3.5 h-3.5 rounded bg-white/10 shrink-0 animate-pulse" />
                    <div
                      className="h-3 rounded bg-white/10 animate-pulse"
                      style={{ width: `${55 + (i % 3) * 15}%` }}
                    />
                  </div>
                ))}
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

        {/* Auth buttons for mobile unauthenticated users */}
        {!isSignedIn && (
          <div className="md:hidden mt-auto flex flex-col gap-2 pt-4 border-t border-white/5">
            <button
              onClick={() => { dispatch(setSignUp(true)); dispatch(setSideNavOpen(false)); }}
              className="w-full px-4 py-2 rounded-full text-sm font-medium bg-[#19c37d] hover:bg-[#17b371] text-white transition-all cursor-pointer"
            >
              Sign Up
            </button>
            <button
              onClick={() => { dispatch(setSignIn(true)); dispatch(setSideNavOpen(false)); }}
              className="w-full px-4 py-2 rounded-full text-sm font-medium border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
