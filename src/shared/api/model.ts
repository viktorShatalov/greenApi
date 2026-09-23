export interface GreenCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface SendMessageResponse {
  idMessage?: string;
}

export interface IncomingNotification {
  receiptId: number;
  body: {
    typeWebhook?: string;
    senderData?: { chatId?: string };
    messageData?: { textMessageData?: { textMessage?: string } };
  };
}

export interface GreenApiErrorResponse {
  message?: string;
  error?: string;
}
