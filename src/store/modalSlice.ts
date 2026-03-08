import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
  deleteThreadId: string | null;
}

const initialState: ModalState = {
  isSignInOpen: false,
  isSignUpOpen: false,
  deleteThreadId: null,
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
  },
});

export const { setSignIn, setSignUp, setDeleteThreadId } = modalSlice.actions;
export default modalSlice.reducer;
