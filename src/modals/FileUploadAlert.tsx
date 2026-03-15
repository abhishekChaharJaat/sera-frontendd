"use client";

import { useDispatch, useSelector } from "react-redux";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import ModalBase from "@/components/ModalBase";
import { RootState, AppDispatch } from "@/store/store";
import { setFileUploadError } from "@/store/modalSlice";
import { MAX_FILE_ATTACH } from "@/lib/constants";

const messages: Record<string, { title: string; description: string }> = {
  size: {
    title: "File too large",
    description: "Each file must be 2 MB or smaller. Please choose a smaller file.",
  },
  count: {
    title: "Too many files",
    description: `You can attach up to ${MAX_FILE_ATTACH} files per message. Remove one before adding another.`,
  },
  type: {
    title: "Unsupported file type",
    description: "Only PDF, DOCX, and TXT files are allowed.",
  },
};

export default function FileUploadAlert() {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, errorType } = useSelector(
    (state: RootState) => state.modal.fileUploadError
  );

  if (!isOpen || !errorType) return null;

  const { title, description } = messages[errorType];
  const handleClose = () => dispatch(setFileUploadError(null));

  return (
    <ModalBase onClose={handleClose}>
      <div className="flex flex-col items-center gap-6 px-8 py-4 w-full sm:w-96">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/10">
          <ExclamationTriangleIcon className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <p className="mt-2 text-sm text-white/50">{description}</p>
        </div>
        <button
          onClick={handleClose}
          className="w-full px-4 py-2.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
        >
          Got it
        </button>
      </div>
    </ModalBase>
  );
}
