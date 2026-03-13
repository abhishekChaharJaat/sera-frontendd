import { configureStore } from "@reduxjs/toolkit";

import threadReducer from "./threadSlice";
import messageReducer from "./messageSlice";
import modalReducer from "./modalSlice";

export const store = configureStore({
  reducer: {
    threads: threadReducer,
    messages: messageReducer,
    modal: modalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
