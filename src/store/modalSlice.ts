import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FileUploadErrorType = "size" | "count" | "type";

interface ModalState {
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
  deleteThreadId: string | null;
  isSideNavOpen: boolean;
  fileUploadError: { isOpen: boolean; errorType: FileUploadErrorType | null };
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
    setFileUploadError(state, action: PayloadAction<FileUploadErrorType | null>) {
      state.fileUploadError = {
        isOpen: action.payload !== null,
        errorType: action.payload,
      };
    },
  },
});

export const { setSignIn, setSignUp, setDeleteThreadId, setSideNavOpen, setFileUploadError } = modalSlice.actions;
export default modalSlice.reducer;
