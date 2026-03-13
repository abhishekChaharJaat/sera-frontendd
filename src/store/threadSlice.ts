import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ThreadSummary } from "./types";
import { buildAuth } from "@/lib/helpers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const THREAD_KEY = "active_thread_id";

export const saveThreadId = (id: string) =>
  localStorage.setItem(THREAD_KEY, id);
export const loadThreadId = () => localStorage.getItem(THREAD_KEY);
export const clearThreadId = () => localStorage.removeItem(THREAD_KEY);

interface ThreadState {
  threads: ThreadSummary[];
  threadsInitialized: boolean;
  fetchThreadsLoading: boolean;
  threadCreationLoading: boolean;
  threadCreationError: string | null;
}

const initialState: ThreadState = {
  threads: [],
  threadsInitialized: false,
  fetchThreadsLoading: false,
  threadCreationLoading: false,
  threadCreationError: null,
};

export const createThread = createAsyncThunk(
  "threads/createThread",
  async (_, { rejectWithValue }) => {
    try {
      const { headers, anonParam } = buildAuth();
      const res = await fetch(`${API_BASE}/create-thread${anonParam}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      saveThreadId(data.thread_id);
      return data as { thread_id: string; title: string; created_at: string };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to create thread.",
      );
    }
  },
);

export const fetchThreads = createAsyncThunk(
  "threads/fetchThreads",
  async (_, { rejectWithValue }) => {
    try {
      const { headers } = buildAuth();
      const res = await fetch(`${API_BASE}/list-threads`, { headers });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return (await res.json()) as ThreadSummary[];
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to load threads.",
      );
    }
  },
);

export const deleteThread = createAsyncThunk(
  "threads/deleteThread",
  async (threadId: string, { rejectWithValue }) => {
    try {
      const { headers } = buildAuth();
      const res = await fetch(`${API_BASE}/${threadId}/delete-thread`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return threadId;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to delete thread.",
      );
    }
  },
);

const threadSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {
    updateTitle(
      state,
      action: PayloadAction<{ threadId: string; title: string }>,
    ) {
      const thread = state.threads.find(
        (t) => t.thread_id === action.payload.threadId,
      );
      if (thread) thread.title = action.payload.title;
    },
    clearAuth(state) {
      state.threads = [];
      state.threadsInitialized = false;
      state.threadCreationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createThread.pending, (state) => {
        state.threadCreationLoading = true;
        state.threadCreationError = null;
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.threadCreationLoading = false;
        if (state.threadsInitialized) {
          const { thread_id, title, created_at } = action.payload;
          state.threads.unshift({ thread_id, title, created_at });
        }
      })
      .addCase(createThread.rejected, (state, action) => {
        state.threadCreationLoading = false;
        state.threadCreationError =
          (action.payload as string) ?? "Failed to create thread.";
      })
      .addCase(fetchThreads.pending, (state) => {
        state.fetchThreadsLoading = true;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.fetchThreadsLoading = false;
        state.threads = action.payload;
        state.threadsInitialized = true;
      })
      .addCase(fetchThreads.rejected, (state) => {
        state.fetchThreadsLoading = false;
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(
          (t) => t.thread_id !== action.payload,
        );
      });
  },
});

export const { updateTitle, clearAuth } = threadSlice.actions;
export const threadActions = threadSlice.actions;
export default threadSlice.reducer;
