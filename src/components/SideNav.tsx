"use client";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "@/store/store";
import { clearMessages } from "@/store/chatSlice";
import SeraLogo from "@/components/SeraLogo";

export default function SideNav() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const threadData = useSelector((state: RootState) => state.chat.threadData);

  const handleNewChat = () => {
    dispatch(clearMessages());
    router.push("/");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-50 bg-[#171717] border-r border-white/5 flex flex-col px-4 py-4 gap-4 z-50">
      {/* Logo */}
      <div className="px-1 py-1">
        <SeraLogo />
      </div>

      {/* New Chat */}
      {threadData && (
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 mt-4 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm transition-all cursor-pointer"
          title="New Chat"
        >
          <PencilSquareIcon className="w-4 h-4" />
          New Chat
        </button>
      )}
    </aside>
  );
}
