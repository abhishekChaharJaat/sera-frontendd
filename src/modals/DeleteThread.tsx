"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import ModalBase from "@/components/ModalBase";
import { RootState, AppDispatch } from "@/store/store";
import { setDeleteThreadId } from "@/store/modalSlice";
import { deleteThread } from "@/store/threadSlice";

const DeleteThread = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const threadId = useSelector((state: RootState) => state.modal.deleteThreadId);
  const currentThreadId = useSelector((state: RootState) => state.messages.threadData?.thread_id);

  if (!threadId) return null;

  const handleClose = () => dispatch(setDeleteThreadId(null));

  const handleConfirm = () => {
    dispatch(deleteThread(threadId)).then(() => {
      if (currentThreadId === threadId) router.push("/home");
    });
    handleClose();
  };

  return (
    <ModalBase onClose={handleClose}>
      <div className="flex flex-col items-center gap-6 px-8 py-4 w-96">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-white font-semibold text-lg">Delete thread?</h2>
          <p className="mt-2 text-sm text-white/50">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

export default DeleteThread;
