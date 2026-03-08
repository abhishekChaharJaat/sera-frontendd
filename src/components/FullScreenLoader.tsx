"use client";

import { useAuth } from "@clerk/nextjs";

export default function FullScreenLoader() {
  const { isLoaded } = useAuth();

  if (isLoaded) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#212121]">
      <div className="w-6 h-6 border-2 border-[#19c37d]/30 border-t-[#19c37d] rounded-full animate-spin" />
    </div>
  );
}
