"use client";

import { useRef, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";

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
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div
          className={`relative flex items-end bg-[#2f2f2f] border border-white/10 shadow-lg transition-all duration-200 ${isMultiline ? "rounded-2xl" : "rounded-full"}`}
        >
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
              text-sm px-4 py-3.5 pr-12 resize-none outline-none
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
  );
}
