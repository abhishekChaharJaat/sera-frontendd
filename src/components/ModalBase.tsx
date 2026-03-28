"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalBaseProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalBase({ onClose, children }: ModalBaseProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" />

      {/* Box — bottom sheet on mobile, centered card on desktop */}
      <div
        className="relative z-10 w-full md:w-fit bg-(--input-bg) border border-(--border-subtle) rounded-t-3xl rounded-b-none md:rounded-2xl shadow-xl overflow-y-auto overflow-x-hidden max-h-[90dvh] md:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2.5 rounded-xl text-(--text-subtle) hover:text-(--text-muted) hover:bg-(--surface-muted) transition-all cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>
  );
}
