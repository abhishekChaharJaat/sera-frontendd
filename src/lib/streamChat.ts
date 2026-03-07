import { Dispatch } from "@reduxjs/toolkit";
import { chatActions } from "@/store/chatSlice";

export async function streamChat(
  res: Response,
  dispatch: Dispatch,
): Promise<void> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const tempAssistantId = crypto.randomUUID();
  let isFirstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const event = JSON.parse(line.slice(6));

      if (event.type === "user_message") {
        dispatch(chatActions.addMessage({
          id: event.id,
          role: "user",
          content: event.content,
          timestamp: Date.now(),
        }));
      } else if (event.type === "chunk") {
        if (isFirstChunk) {
          dispatch(chatActions.addMessage({
            id: tempAssistantId,
            role: "assistant",
            content: event.content,
            timestamp: Date.now(),
          }));
          dispatch(chatActions.setIsStreaming(true));
          isFirstChunk = false;
        } else {
          dispatch(chatActions.appendChunk({
            messageId: tempAssistantId,
            content: event.content,
          }));
        }
      } else if (event.type === "title") {
        dispatch(chatActions.updateTitle(event.title));
      } else if (event.type === "done") {
        dispatch(chatActions.updateMessageId({
          oldId: tempAssistantId,
          newId: event.id,
        }));
        dispatch(chatActions.setIsStreaming(false));
      }
    }
  }
}
