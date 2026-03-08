"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Message } from "@/store/types";

// LLMs often generate indented code fences inside lists (e.g. "   ```javascript")
// but leave the code content un-indented. CommonMark/remark then fails to parse
// them as fenced code blocks. This strips the indent from the fence opener/closer
// and normalises the content lines so remark always sees a top-level code fence.
function preprocessMarkdown(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;
  let fenceIndent = 0;

  for (const line of lines) {
    if (!inCodeBlock) {
      const match = line.match(/^(\s*)(```|~~~)(.*)/);
      if (match) {
        inCodeBlock = true;
        fenceIndent = match[1].length;
        result.push(match[2] + match[3]);
      } else {
        result.push(line);
      }
    } else {
      const closing = line.match(/^(\s*)(```|~~~)\s*$/);
      if (closing) {
        inCodeBlock = false;
        fenceIndent = 0;
        result.push(closing[2]);
      } else {
        // Strip up to fenceIndent leading spaces from content lines
        result.push(fenceIndent > 0 ? line.replace(new RegExp(`^\\s{0,${fenceIndent}}`), "") : line);
      }
    }
  }

  return result.join("\n");
}

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <pre className="relative group bg-[#1a1a1a] border border-white/10 rounded-lg p-3 overflow-x-auto my-2">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        title="Copy code"
      >
        {copied ? <CheckIcon className="w-3.5 h-3.5 text-[#19c37d]" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
      </button>
      <code className={`${className} text-xs`}>{children}</code>
    </pre>
  );
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="bg-[#2f2f2f] text-[#ececec] rounded-2xl rounded-tr-sm px-4 py-3 text-base leading-relaxed max-w-[75%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start px-4 py-2">
      <div className="text-[#ececec] text-base leading-relaxed w-full prose prose-invert prose-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const isBlock = className?.includes("language-");
              return isBlock ? (
                <CodeBlock className={className}>{children}</CodeBlock>
              ) : (
                <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-xs text-[#19c37d]" {...props}>
                  {children}
                </code>
              );
            },
            ul({ children }) {
              return <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>;
            },
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            strong({ children }) {
              return <strong className="font-semibold text-white">{children}</strong>;
            },
            a({ href, children }) {
              return <a href={href} target="_blank" rel="noreferrer" className="text-[#19c37d] underline">{children}</a>;
            },
          }}
        >
          {preprocessMarkdown(message.content)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
