import {
  deleteNotification,
  receiveNotification,
  sendMessage,
} from '../../../shared/api/greenApi';
import type { IncomingNotification, GreenCredentials } from '../../../shared/api/model';

export interface IncomingMessage {
  chatId: string;
  id: string;
  text: string;
  createdAt: number;
}

interface PollingHandlers {
  onMessage: (message: IncomingMessage) => void;
  onError: (error: Error) => void;
}

export const sendChatMessage = (
  credentials: GreenCredentials,
  chatId: string,
  text: string,
) => sendMessage(credentials, chatId, text);

export interface SendChatMessageResult {
  ok: boolean;
  error?: string;
}

export const sendChatMessageSafely = async (
  credentials: GreenCredentials,
  chatId: string,
  text: string,
): Promise<SendChatMessageResult> => {
  try {
    await sendChatMessage(credentials, chatId, text);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Сообщение не отправлено',
    };
  }
};


const mapNotificationToMessage = (notification: IncomingNotification): IncomingMessage | null => {
  const { body } = notification;
  const chatId = body.senderData?.chatId;
  const text = body.messageData?.textMessageData?.textMessage;

  if (body.typeWebhook !== 'incomingMessageReceived' || !chatId || !text) {
    return null;
  }

  return {
    chatId,
    id: `incoming-${notification.receiptId}`,
    text,
    createdAt: Date.now(),
  };
};


export const startIncomingMessagesPolling = (
  credentials: GreenCredentials,
  { onMessage, onError }: PollingHandlers,
) => {
  const controller = new AbortController();
  let stopped = false;

  const poll = async (): Promise<void> => {
    try {
      const notification = await receiveNotification(credentials, controller.signal);
      if (notification && !stopped) {
        const message = mapNotificationToMessage(notification);
        if (message) onMessage(message);
        await deleteNotification(credentials, notification.receiptId);
      }
    } catch (error) {
      if (!stopped) {
        onError(error instanceof Error ? error : new Error('Ошибка получения сообщений'));
      }
    } finally {
      if (!stopped) void poll();
    }
  };

  void poll();

  return () => {
    stopped = true;
    controller.abort();
  };
};
