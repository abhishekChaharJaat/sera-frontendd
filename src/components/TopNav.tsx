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
import ThemeToggle from "@/components/ThemeToggle";

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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-(--border-subtle) text-(--text-muted) hover:text-(--foreground) hover:border-(--border-muted) transition-all cursor-pointer"
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
      className="px-4 py-1.5 rounded-full text-sm font-medium border border-(--border-muted) hover:border-(--border-muted) text-(--text-muted) hover:text-(--foreground) transition-all cursor-pointer"
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
    <header className="sticky top-0 z-10 flex items-center px-4 sm:px-6 py-3 h-14 shrink-0 gap-2 bg-(--background)">
      {page === PAGE.UNAUTH_HOME && <LogoMenuButton />}
      {page === PAGE.CHAT && (
        <button
          onClick={() => dispatch(setSideNavOpen(true))}
          className="md:hidden p-1.5 rounded-lg text-(--text-muted) hover:text-(--foreground) hover:bg-(--surface-subtle) transition-all cursor-pointer shrink-0"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}

      {/* ======================= UNAUTH HOME PAGE ======================== */}
      {page === PAGE.UNAUTH_HOME && (
        <div className="flex justify-end flex-1 gap-2 items-center">
          <ThemeToggle />
          <SigninButton />
          <SignupButton />
        </div>
      )}

      {/* ======================= AUTH HOME PAGE ======================== */}
      {page === PAGE.HOME && (
        <>
          {/* Mobile: hamburger | centered logo | toggle + user */}
          <div className="flex items-center justify-between w-full md:hidden">
            <button
              onClick={() => dispatch(setSideNavOpen(true))}
              className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--foreground) hover:bg-(--surface-subtle) transition-all cursor-pointer"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <SeraLogo />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
          {/* Desktop: toggle + user on right */}
          <div className="hidden md:flex justify-end flex-1 items-center gap-1">
            <ThemeToggle />
            <UserButton />
          </div>
        </>
      )}

      {/* ======================= UNAUTH CHAT PAGE ======================== */}
      {page === PAGE.UNAUTH_CHAT && (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push("/")}
            className="shrink-0 p-1.5 rounded-full text-(--text-muted) hover:text-(--foreground) bg-(--surface-subtle) hover:bg-(--surface-muted) border border-(--border-subtle) hover:border-(--border-muted) transition-all cursor-pointer"
            title="New Chat"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <span className="flex-1 text-(--text-muted) text-sm font-medium truncate">
            {threadData?.title || "New Thread"}
          </span>
          <div className="shrink-0 flex items-center gap-1">
            <ThemeToggle />
            <SignupButton />
          </div>
        </div>
      )}

      {/* ======================= AUTH CHAT PAGES ======================== */}
      {page === PAGE.CHAT && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-(--text-muted) text-sm font-medium truncate mr-2">
            {threadData?.title || "New Thread"}
          </span>
          <div className="flex gap-2 items-center shrink-0">
            <ThemeToggle />
            <ShareButton />
            <UserButton />
          </div>
        </div>
      )}
    </header>
  );
}
