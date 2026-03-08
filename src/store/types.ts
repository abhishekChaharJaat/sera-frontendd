export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ThreadData {
  thread_id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

export interface ThreadSummary {
  thread_id: string;
  title: string;
  created_at: string;
}

