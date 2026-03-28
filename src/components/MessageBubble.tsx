"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon, CheckIcon, DocumentIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
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
    <pre className="relative group bg-(--code-bg) border border-(--border-subtle) rounded-lg p-3 overflow-x-auto my-2">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-(--surface-subtle) hover:bg-(--surface-muted) text-(--text-subtle) hover:text-(--text-muted) opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
        <div className="flex flex-col items-end gap-1.5 max-w-[85%] sm:max-w-[75%]">
          {message.content && (
            <div className="bg-(--input-bg) text-(--foreground) rounded-2xl rounded-tr-sm px-4 py-3 text-base leading-relaxed">
              {message.content}
            </div>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {message.attachments.map((att, i) => (
                <div key={i} className="relative group flex items-center gap-1.5 bg-(--surface-muted) rounded-xl px-2.5 py-1.5 w-52">
                  <DocumentIcon className="w-4 h-4 text-(--text-muted) shrink-0" />
                  <span className="text-xs text-(--text-muted) truncate flex-1 min-w-0">{att.filename}</span>
                  {att.status === "pending" && (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-(--border-muted) border-t-(--text-muted) animate-spin shrink-0" />
                  )}
                  {att.status === "success" && (
                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  )}
                  {att.status === "failed" && (
                    <>
                      <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {att.reason && (
                        <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block bg-(--code-bg) border border-(--border-subtle) text-red-400 text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 pointer-events-none">
                          {att.reason}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start px-4 py-2">
      <div className="text-(--foreground) text-base leading-relaxed w-full prose prose-invert prose-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const isBlock = className?.includes("language-");
              return isBlock ? (
                <CodeBlock className={className}>{children}</CodeBlock>
              ) : (
                <code className="bg-(--code-bg) px-1.5 py-0.5 rounded text-xs text-[#19c37d]" {...props}>
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
              return <strong className="font-semibold text-(--foreground)">{children}</strong>;
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
