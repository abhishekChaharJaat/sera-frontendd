"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function TopNav() {
  const threadData = useSelector((state: RootState) => state.chat.threadData);

  return (
    <header className="flex items-center px-6 py-3 h-14  shrink-0">
      {threadData?.title && (
        <span className="text-white/60 text-sm font-medium truncate">
          {threadData.title}
        </span>
      )}
    </header>
  );
}
