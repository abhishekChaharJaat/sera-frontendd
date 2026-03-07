import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Message, ThreadData } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const THREAD_KEY = "active_thread_id";

export const saveThreadId = (id: string) => localStorage.setItem(THREAD_KEY, id);
export const loadThreadId = () => localStorage.getItem(THREAD_KEY);
export const clearThreadId = () => localStorage.removeItem(THREAD_KEY);

interface ChatState {
  threadData: ThreadData | null;
  threadCreationLoading: boolean;
  threadCreationError: string | null;
  fetchMessagesLoading: boolean;
  fetchMessagesError: string | null;
  sendMessageLoading: boolean;
  sendMessageError: string | null;
  // true while SSE chunks are being received (after first chunk, before done)
  isStreaming: boolean;
}

const initialState: ChatState = {
  threadData: null,
  threadCreationLoading: false,
  threadCreationError: null,
  fetchMessagesLoading: false,
  fetchMessagesError: null,
  sendMessageLoading: false,
  sendMessageError: null,
  isStreaming: false,
};

export const createThread = createAsyncThunk(
  "chat/createThread",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/create-thread`, { method: "POST" });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      saveThreadId(data.thread_id);
      return data as ThreadData;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to create thread.",
      );
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (threadId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/${threadId}/list-messages`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      // Map backend messages (_id → id)
      const messages: Message[] = data.messages.map((m: { _id?: string; role: "user" | "assistant"; content: string; timestamp: string }) => ({
        id: m._id ?? crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).getTime(),
      }));
      return { ...data, messages } as ThreadData;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to load messages.",
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { threadId, message }: { threadId: string; message: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { streamChat } = await import("@/lib/streamChat");

      // Step 1: Save user message to DB and render it immediately
      const sendRes = await fetch(`${API_BASE}/${threadId}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!sendRes.ok) throw new Error(`API error: ${sendRes.status}`);
      await streamChat(sendRes, dispatch);

      // Step 2: Generate AI response (title + streamed reply)
      const genRes = await fetch(`${API_BASE}/${threadId}/generate-response`, {
        method: "POST",
      });
      if (!genRes.ok) throw new Error(`API error: ${genRes.status}`);
      await streamChat(genRes, dispatch);
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      if (state.threadData) {
        state.threadData.messages.push(action.payload);
      }
    },
    // Append a streaming chunk to an existing assistant message
    appendChunk(state, action: PayloadAction<{ messageId: string; content: string }>) {
      if (state.threadData) {
        const msg = state.threadData.messages.find(
          (m) => m.id === action.payload.messageId,
        );
        if (msg) msg.content += action.payload.content;
      }
    },
    // Replace temp assistant message ID with the real DB ID after streaming ends
    updateMessageId(state, action: PayloadAction<{ oldId: string; newId: string }>) {
      if (state.threadData) {
        const msg = state.threadData.messages.find(
          (m) => m.id === action.payload.oldId,
        );
        if (msg) msg.id = action.payload.newId;
      }
    },
    updateTitle(state, action: PayloadAction<string>) {
      if (state.threadData) {
        state.threadData.title = action.payload;
      }
    },
    setIsStreaming(state, action: PayloadAction<boolean>) {
      state.isStreaming = action.payload;
    },
    clearMessages(state) {
      state.threadData = null;
      state.threadCreationError = null;
      state.fetchMessagesError = null;
      state.sendMessageError = null;
      state.isStreaming = false;
      clearThreadId();
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
        state.threadData = action.payload;
      })
      .addCase(createThread.rejected, (state, action) => {
        state.threadCreationLoading = false;
        state.threadCreationError = (action.payload as string) ?? "Failed to create thread.";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.fetchMessagesLoading = true;
        state.fetchMessagesError = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.fetchMessagesLoading = false;
        state.threadData = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.fetchMessagesLoading = false;
        state.fetchMessagesError = (action.payload as string) ?? "Failed to load messages.";
        clearThreadId();
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendMessageLoading = true;
        state.sendMessageError = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.sendMessageLoading = false;
        state.isStreaming = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendMessageLoading = false;
        state.isStreaming = false;
        state.sendMessageError = (action.payload as string) ?? "Something went wrong.";
      });
  },
});

export const { addMessage, appendChunk, updateMessageId, updateTitle, setIsStreaming, clearMessages } = chatSlice.actions;
export const chatActions = chatSlice.actions;
export default chatSlice.reducer;
