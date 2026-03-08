"use client";

import { useRef, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import UnderConstruction from "@/modals/UnderConstruction";

interface ChatBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function ChatBox({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isMultiline, setIsMultiline] = useState(false);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const height = Math.min(ta.scrollHeight, 200);
    ta.style.height = height + "px";
    setIsMultiline(height > 52);
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  };

  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <>
    {showUnderConstruction && <UnderConstruction onClose={() => setShowUnderConstruction(false)} />}
    <div className="px-4 pt-2" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-3xl mx-auto">
        <div
          className={`relative flex items-end bg-[#2f2f2f] border border-white/10 shadow-lg transition-all duration-200 ${isMultiline ? "rounded-2xl" : "rounded-full"}`}
        >
          <button
            onClick={() => setShowUnderConstruction(true)}
            className="shrink-0 ml-3 mb-3 p-1.5 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer"
            title="Attach file"
          >
            <PaperClipIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Message Sera..."
            disabled={disabled}
            rows={1}
            className="
              flex-1 bg-transparent text-[#ececec] placeholder-white/30
              text-sm pl-2 pr-12 py-3.5 resize-none outline-none
              leading-relaxed max-h-50 overflow-y-auto
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`
              absolute right-2 bottom-2 p-2 rounded-full
              transition-all duration-150
              ${
                canSubmit
                  ? "bg-white text-black hover:bg-white/90 cursor-pointer"
                  : "bg-white/30 text-white/70 cursor-not-allowed"
              }
            `}
            title="Send message"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
    </>
  );
}
