"use client";

import { useRef, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { ArrowUpIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { PlusIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { MAX_FILE_ATTACH, MAX_FILE_SIZE } from "@/lib/constants";
import { setFileUploadError } from "@/store/modalSlice";
import { AppDispatch } from "@/store/store";

interface ChatBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (files: File[]) => void;
  disabled: boolean;
}

export default function ChatBox({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatBoxProps) {
  const dispatch = useDispatch<AppDispatch>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const height = Math.min(ta.scrollHeight, 200);
    ta.style.height = height + "px";
    setIsMultiline(height > 62);
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(attachedFiles);
    setAttachedFiles([]);
  };

  const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    if (selected.some((f) => !ALLOWED_TYPES.includes(f.type))) {
      dispatch(setFileUploadError("type"));
      e.target.value = "";
      return;
    }

    if (selected.some((f) => f.size > MAX_FILE_SIZE)) {
      dispatch(setFileUploadError("size"));
      e.target.value = "";
      return;
    }

    if (attachedFiles.length >= MAX_FILE_ATTACH) {
      dispatch(setFileUploadError("count"));
      e.target.value = "";
      return;
    }

    const valid = selected.filter((f) => f.size <= MAX_FILE_SIZE);
    if (attachedFiles.length + valid.length > MAX_FILE_ATTACH) {
      dispatch(setFileUploadError("count"));
      e.target.value = "";
      return;
    }
    setAttachedFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit =
    !disabled && (value.trim().length > 0 || attachedFiles.length > 0);
  const canAddMore = attachedFiles.length < MAX_FILE_ATTACH;
  const hasFiles = attachedFiles.length > 0;

  return (
    <div
      className="px-4 pt-2"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={`relative bg-[#2f2f2f] border border-white/10 shadow-lg transition-all duration-200 ${
            isMultiline || hasFiles ? "rounded-2xl" : "rounded-full"
          }`}
        >
          {/* File chips */}
          {hasFiles && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {attachedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 max-w-50"
                >
                  <DocumentIcon className="w-4 h-4 text-white/50 shrink-0" />
                  <span className="text-xs text-white/70 truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="shrink-0 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => canAddMore && fileInputRef.current?.click()}
              disabled={!canAddMore}
              className={`shrink-0 ml-3 mb-3 p-1.5 rounded-full transition-all ${
                canAddMore
                  ? "text-white/30 hover:text-white/60 hover:bg-white/5 cursor-pointer"
                  : "text-white/15 cursor-not-allowed"
              }`}
              title={
                canAddMore ? "Attach file (max 2)" : "Maximum 2 files attached"
              }
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
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
                text-base md:text-sm pl-2 pr-12 py-3.5 resize-none outline-none
                leading-relaxed max-h-50 overflow-y-auto
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
            <button
              onClick={handleSubmit}
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
        </div>
        <p className="text-center text-xs text-white/20 mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
