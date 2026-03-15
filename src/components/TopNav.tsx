"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ShareIcon, CheckIcon, PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";

import { RootState, AppDispatch } from "@/store/store";
import { setSignIn, setSignUp, setSideNavOpen } from "@/store/modalSlice";
import { PAGE } from "@/lib/constants";
import SeraLogo from "@/components/SeraLogo";

interface TopNavPropTypes {
  page: string;
}
export default function TopNav(props: TopNavPropTypes) {
  const { page } = props;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const threadData = useSelector((state: RootState) => state.messages.threadData);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!threadData?.thread_id) return;
    const shareUrl = `${window.location.origin}/shared/${threadData.thread_id}`;
    navigator.clipboard.writeText(shareUrl);
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
          <span className="hidden md:inline text-[#19c37d]">Copied</span>
        </>
      ) : (
        <>
          <ShareIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Share</span>
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

  const LogoMenuButton = () => (
    <button
      onClick={() => dispatch(setSideNavOpen(true))}
      className="md:hidden cursor-pointer shrink-0"
      title="Menu"
    >
      <SeraLogo />
    </button>
  );

  return (
    <header className="sticky top-0 z-10 flex items-center px-4 sm:px-6 py-3 h-14 shrink-0 gap-2 bg-[#212121]">
      {page === PAGE.UNAUTH_HOME && <LogoMenuButton />}
      {page === PAGE.CHAT && (
        <button
          onClick={() => dispatch(setSideNavOpen(true))}
          className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer shrink-0"
        >
          <Bars3Icon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* ======================= UNAUTH HOME PAGE ======================== */}
      {page === PAGE.UNAUTH_HOME && (
        <div className="flex justify-end flex-1 gap-2">
          <SigninButton />
          <SignupButton />
        </div>
      )}

      {/* ======================= AUTH HOME PAGE ======================== */}
      {page === PAGE.HOME && (
        <>
          {/* Mobile: hamburger | centered logo | user */}
          <div className="flex items-center justify-between w-full md:hidden">
            <button
              onClick={() => dispatch(setSideNavOpen(true))}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Bars3Icon className="w-6 h-6 text-white" />
            </button>
            <SeraLogo />
            <UserButton />
          </div>
          {/* Desktop: just user on right */}
          <div className="hidden md:flex justify-end flex-1">
            <UserButton />
          </div>
        </>
      )}

      {/* ======================= UNAUTH CHAT PAGE ======================== */}
      {page === PAGE.UNAUTH_CHAT && (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push("/")}
            className="shrink-0 p-1.5 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            title="New Chat"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <span className="flex-1 text-white/60 text-sm font-medium truncate">
            {threadData?.title || "New Thread"}
          </span>
          <div className="shrink-0">
            <SignupButton />
          </div>
        </div>
      )}

      {/* ======================= AUTH CHAT PAGES ======================== */}
      {page === PAGE.CHAT && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-white/60 text-sm font-medium truncate mr-2">
            {threadData?.title || "New Thread"}
          </span>
          <div className="flex gap-2 items-center shrink-0">
            <ShareButton />
            <UserButton />
          </div>
        </div>
      )}
    </header>
  );
}
