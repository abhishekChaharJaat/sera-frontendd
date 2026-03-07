"use client";

export default function ThinkingBubble() {
  return (
    <div className="flex justify-start px-4 py-2">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
