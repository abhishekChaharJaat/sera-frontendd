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
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Box */}
      <div
        className="relative z-10 w-fit bg-[#2f2f2f] border border-white/10 rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        {children}
      </div>
    </div>
  );
}
