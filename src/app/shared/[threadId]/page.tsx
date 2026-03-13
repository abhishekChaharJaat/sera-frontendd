"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SparklesIcon } from "@heroicons/react/24/outline";
import MessageBubble from "@/components/MessageBubble";
import SeraLogo from "@/components/SeraLogo";
import { Message } from "@/store/types";
import { useViewportFix } from "@/hooks/useViewportFix";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SharedThreadData {
  thread_id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

export default function SharedPage() {
  const containerRef = useViewportFix();
  const { threadId } = useParams<{ threadId: string }>();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<SharedThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    fetch(`${API_BASE}/${threadId}/get-shared-messages`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages: Message[] = (json.messages ?? []).map((m: any) => ({
          id: m._id ?? crypto.randomUUID(),
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).getTime(),
        }));
        setData({ ...json, messages });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [threadId]);

  useEffect(() => {
    if (data) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  if (loading) {
    return (
      <div ref={containerRef} className="fixed left-0 right-0 top-0 z-[60] bg-[#212121] flex items-center justify-center" style={{ height: "100dvh" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading conversation…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div ref={containerRef} className="fixed left-0 right-0 top-0 z-[60] bg-[#212121] flex items-center justify-center" style={{ height: "100dvh" }}>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-white/60 text-sm">This conversation could not be found.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#19c37d] hover:bg-[#17b371] text-white transition-all cursor-pointer"
          >
            Go to Sera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed left-0 right-0 top-0 z-[60] bg-[#212121] flex flex-col" style={{ height: "100dvh" }}>
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-10 flex items-center px-4 sm:px-6 py-3 h-14 shrink-0 gap-3 bg-[#212121] border-b border-white/5">
        <div className="shrink-0">
          <SeraLogo />
        </div>
        <span className="flex-1 text-white/60 text-sm font-medium truncate">
          {data.title || "Shared conversation"}
        </span>
        <button
          onClick={() => router.push("/")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#19c37d] hover:bg-[#17b371] text-white transition-all cursor-pointer"
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Try Sera</span>
        </button>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4 space-y-1 max-w-3xl mx-auto w-full">
          {data.messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="shrink-0 px-4 py-3 border-t border-white/5 bg-[#212121]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#2f2f2f] border border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <SparklesIcon className="w-4 h-4 text-[#19c37d] shrink-0" />
            <p className="text-xs sm:text-sm text-white/70 truncate">
              Start your own conversation with Sera — it&apos;s free.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-[#19c37d] hover:bg-[#17b371] text-white transition-all cursor-pointer"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}
