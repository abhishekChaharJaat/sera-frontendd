import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Attachment, Message, ThreadData } from "./types";
import { buildAuth, fileToBase64 } from "@/lib/helpers";
import {
  createThread,
  deleteThread,
  clearAuth,
  updateTitle,
  clearThreadId,
} from "./threadSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface MessageState {
  threadData: ThreadData | null;
  fetchMessagesLoading: boolean;
  fetchMessagesError: string | null;
  sendMessageLoading: boolean;
  sendMessageError: string | null;
  isStreaming: boolean;
}

const initialState: MessageState = {
  threadData: null,
  fetchMessagesLoading: false,
  fetchMessagesError: null,
  sendMessageLoading: false,
  sendMessageError: null,
  isStreaming: false,
};

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (threadId: string, { rejectWithValue }) => {
    try {
      const { headers, anonParam } = buildAuth();
      const res = await fetch(
        `${API_BASE}/${threadId}/list-messages${anonParam}`,
        { headers },
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages: Message[] = data.messages.map((m: any) => ({
        id: m._id ?? crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).getTime(),
        attachments: (m.attachments ?? []).map((a: any) => ({
          file_id: a.file_id,
          filename: a.filename,
          content_type: a.content_type,
          size: a.size,
          status: a.status as "success" | "failed",
          reason: a.reason || undefined,
        })) as Attachment[],
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
  "messages/sendMessage",
  async (
    {
      threadId,
      message,
      tempMsgId,
      attachments,
    }: {
      threadId: string;
      message: string;
      tempMsgId?: string;
      attachments?: File[];
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { streamChat } = await import("@/lib/streamChat");
      const { headers, anonParam } = buildAuth();

      const resolvedAttachments: Attachment[] = (attachments ?? []).map(
        (file) => ({
          filename: file.name,
          content_type: file.type,
          size: file.size,
          status: file.size > MAX_FILE_SIZE ? "failed" : "success",
          reason:
            file.size > MAX_FILE_SIZE
              ? "File size limit exceeded (max 5MB)"
              : undefined,
        }),
      );

      const attachmentPayload = await Promise.all(
        (attachments ?? []).map(async (file) => ({
          filename: file.name,
          content_type: file.type,
          data: await fileToBase64(file),
        })),
      );

      const sendRes = await fetch(
        `${API_BASE}/${threadId}/send-message${anonParam}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ message, attachments: attachmentPayload }),
        },
      );
      if (!sendRes.ok) throw new Error(`API error: ${sendRes.status}`);
      await streamChat(sendRes, dispatch, tempMsgId, resolvedAttachments);

      const genRes = await fetch(
        `${API_BASE}/${threadId}/generate-response${anonParam}`,
        {
          method: "POST",
          headers,
        },
      );
      if (!genRes.ok) throw new Error(`API error: ${genRes.status}`);
      await streamChat(genRes, dispatch, undefined, undefined, threadId);
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  },
);

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      if (state.threadData) {
        state.threadData.messages.push(action.payload);
      }
    },
    appendChunk(
      state,
      action: PayloadAction<{ messageId: string; content: string }>,
    ) {
      if (state.threadData) {
        const msg = state.threadData.messages.find(
          (m) => m.id === action.payload.messageId,
        );
        if (msg) msg.content += action.payload.content;
      }
    },
    updateMessageId(
      state,
      action: PayloadAction<{ oldId: string; newId: string }>,
    ) {
      if (state.threadData) {
        const msg = state.threadData.messages.find(
          (m) => m.id === action.payload.oldId,
        );
        if (msg) msg.id = action.payload.newId;
      }
    },
    updateMessageAttachments(
      state,
      action: PayloadAction<{ messageId: string; attachments: Attachment[] }>,
    ) {
      if (state.threadData) {
        const msg = state.threadData.messages.find(
          (m) => m.id === action.payload.messageId,
        );
        if (msg && msg.role === "user")
          msg.attachments = action.payload.attachments;
      }
    },
    setIsStreaming(state, action: PayloadAction<boolean>) {
      state.isStreaming = action.payload;
    },
    clearMessages(state) {
      state.threadData = null;
      state.fetchMessagesError = null;
      state.sendMessageError = null;
      state.isStreaming = false;
      clearThreadId();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createThread.fulfilled, (state, action) => {
        state.threadData = {
          thread_id: action.payload.thread_id,
          title: action.payload.title,
          created_at: action.payload.created_at,
          messages: [],
        };
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
        state.fetchMessagesError =
          (action.payload as string) ?? "Failed to load messages.";
        clearThreadId();
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        if (state.threadData?.thread_id === action.payload) {
          state.threadData = null;
          clearThreadId();
        }
      })
      .addCase(clearAuth, (state) => {
        state.threadData = null;
        state.fetchMessagesError = null;
        state.sendMessageError = null;
        state.isStreaming = false;
        clearThreadId();
      })
      .addCase(updateTitle, (state, action) => {
        if (
          state.threadData &&
          state.threadData.thread_id === action.payload.threadId
        ) {
          state.threadData.title = action.payload.title;
        }
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
        state.sendMessageError =
          (action.payload as string) ?? "Something went wrong.";
      });
  },
});

export const {
  addMessage,
  appendChunk,
  updateMessageId,
  updateMessageAttachments,
  setIsStreaming,
  clearMessages,
} = messageSlice.actions;
export const messageActions = messageSlice.actions;
export default messageSlice.reducer;
