import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FileUploadErrorType = "size" | "count" | "type" | "thread_limit";

interface ModalState {
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
  deleteThreadId: string | null;
  isSideNavOpen: boolean;
  fileUploadError: { isOpen: boolean; errorType: FileUploadErrorType | null; remainingSlots?: number };
}

const initialState: ModalState = {
  isSignInOpen: false,
  isSignUpOpen: false,
  deleteThreadId: null,
  isSideNavOpen: false,
  fileUploadError: { isOpen: false, errorType: null },
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setSignIn(state, action: PayloadAction<boolean>) {
      state.isSignInOpen = action.payload;
      if (action.payload) state.isSignUpOpen = false;
    },
    setSignUp(state, action: PayloadAction<boolean>) {
      state.isSignUpOpen = action.payload;
      if (action.payload) state.isSignInOpen = false;
    },
    setDeleteThreadId(state, action: PayloadAction<string | null>) {
      state.deleteThreadId = action.payload;
    },
    setSideNavOpen(state, action: PayloadAction<boolean>) {
      state.isSideNavOpen = action.payload;
    },
    setFileUploadError(
      state,
      action: PayloadAction<{ errorType: FileUploadErrorType; remainingSlots?: number } | null>
    ) {
      if (action.payload === null) {
        state.fileUploadError = { isOpen: false, errorType: null };
      } else {
        state.fileUploadError = {
          isOpen: true,
          errorType: action.payload.errorType,
          remainingSlots: action.payload.remainingSlots,
        };
      }
    },
  },
});

export const { setSignIn, setSignUp, setDeleteThreadId, setSideNavOpen, setFileUploadError } = modalSlice.actions;
export default modalSlice.reducer;
