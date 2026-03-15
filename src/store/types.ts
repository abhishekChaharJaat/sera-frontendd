export interface Attachment {
  file_id?: string;
  filename: string;
  content_type: string;
  size: number;
  status: "pending" | "success" | "failed";
  reason?: string;
}

interface BaseMessage {
  id: string;
  content: string;
  timestamp: number;
}

export interface UserMessage extends BaseMessage {
  role: "user";
  attachments?: Attachment[];
}

export interface AssistantMessage extends BaseMessage {
  role: "assistant";
}

export type Message = UserMessage | AssistantMessage;

export interface ThreadData {
  thread_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  attached_files: number;
}

export interface ThreadSummary {
  thread_id: string;
  title: string;
  created_at: string;
}
