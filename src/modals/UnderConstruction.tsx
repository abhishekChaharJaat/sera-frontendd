"use client";

import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import ModalBase from "@/components/ModalBase";

interface UnderConstructionProps {
  onClose: () => void;
}

const UnderConstruction = ({ onClose }: UnderConstructionProps) => {
  return (
    <ModalBase onClose={onClose}>
      <div className="flex flex-col items-center gap-6 px-8 py-4 w-80">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/10">
          <WrenchScrewdriverIcon className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">Under Construction</h2>
          <p className="mt-2 text-sm text-white/50">File uploads are coming soon. Stay tuned!</p>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
        >
          Got it
        </button>
      </div>
    </ModalBase>
  );
};

export default UnderConstruction;
