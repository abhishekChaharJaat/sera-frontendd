"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserButton } from "@clerk/nextjs";
import { ShareIcon, CheckIcon } from "@heroicons/react/24/outline";

import { RootState, AppDispatch } from "@/store/store";
import { setSignIn, setSignUp } from "@/store/modalSlice";
import { PAGE } from "@/lib/constants";

interface TopNavPropTypes {
  page: string;
}
export default function TopNav(props: TopNavPropTypes) {
  const { page } = props;
  const dispatch = useDispatch<AppDispatch>();
  const threadData = useSelector((state: RootState) => state.chat.threadData);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ShareButton = () => (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer"
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5 text-[#19c37d]" />
          <span className="text-[#19c37d]">Copied</span>
        </>
      ) : (
        <>
          <ShareIcon className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );

  const SigninButton = () => (
    <button
      onClick={() => dispatch(setSignIn(true))}
      className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-all cursor-pointer"
    >
      Sign In
    </button>
  );

  const SignupButton = () => (
    <button
      onClick={() => dispatch(setSignUp(true))}
      className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#19c37d] hover:bg-[#17b371] text-white transition-all cursor-pointer"
    >
      Sign Up
    </button>
  );

  return (
    <header className="flex items-center justify-between px-6 py-3 h-14 shrink-0">
      {/* ======================= UNAUTH HOME PAGE ======================== */}
      {page === PAGE.UNAUTH_HOME && (
        <div className="flex justify-end w-full gap-2">
          <SigninButton />
          <SignupButton />
        </div>
      )}

      {/* ======================= AUTH HOME PAGE ======================== */}
      {page === PAGE.HOME && (
        <div className="flex justify-end w-full">
          <UserButton />
        </div>
      )}

      {/* ======================= UNAUTH CHAT PAGE ======================== */}
      {page === PAGE.UNAUTH_CHAT && (
        <div className="w-full flex justify-between items-center">
          <span className="text-white/60 text-sm font-medium truncate">
            {threadData?.title || "New Thread"}
          </span>
          <div className="flex gap-2 items-center">
            <SigninButton />
            <SignupButton />
          </div>
        </div>
      )}
      {/* ======================= AUTH CHAT PAGES ======================== */}
      {page === PAGE.CHAT && (
        <div className="w-full flex justify-between items-center">
          <span className="text-white/60 text-sm font-medium truncate">
            {threadData?.title || "New Thread"}
          </span>
          <div className="flex gap-2 items-center">
            <ShareButton />
            <UserButton />
          </div>
        </div>
      )}
    </header>
  );
}
