import { Dispatch } from "@reduxjs/toolkit";
import { Attachment } from "@/store/types";
import { messageActions } from "@/store/messageSlice";
import { updateTitle } from "@/store/threadSlice";

export async function streamChat(
  res: Response,
  dispatch: Dispatch,
  tempMsgId?: string,
  pendingAttachments?: Attachment[],
  threadId?: string,
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
        if (tempMsgId) {
          dispatch(messageActions.updateMessageId({ oldId: tempMsgId, newId: event.id }));
          if (pendingAttachments && pendingAttachments.length > 0 && event.attachments?.length > 0) {
            const merged: Attachment[] = pendingAttachments.map((att, i) => ({
              ...att,
              file_id: event.attachments[i]?.file_id,
            }));
            dispatch(messageActions.updateMessageAttachments({ messageId: event.id, attachments: merged }));
          }
        } else {
          dispatch(messageActions.addMessage({
            id: event.id,
            role: "user",
            content: event.content,
            timestamp: Date.now(),
          }));
        }
      } else if (event.type === "chunk") {
        if (isFirstChunk) {
          dispatch(messageActions.addMessage({
            id: tempAssistantId,
            role: "assistant",
            content: event.content,
            timestamp: Date.now(),
          }));
          dispatch(messageActions.setIsStreaming(true));
          isFirstChunk = false;
        } else {
          dispatch(messageActions.appendChunk({
            messageId: tempAssistantId,
            content: event.content,
          }));
        }
      } else if (event.type === "title") {
        if (threadId) {
          dispatch(updateTitle({ threadId, title: event.title }));
        }
      } else if (event.type === "done") {
        dispatch(messageActions.updateMessageId({
          oldId: tempAssistantId,
          newId: event.id,
        }));
        dispatch(messageActions.setIsStreaming(false));
      }
    }
  }
}
