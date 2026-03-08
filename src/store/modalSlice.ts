import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
}

const initialState: ModalState = {
  isSignInOpen: false,
  isSignUpOpen: false,
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
  },
});

export const { setSignIn, setSignUp } = modalSlice.actions;
export default modalSlice.reducer;
