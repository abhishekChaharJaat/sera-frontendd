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

