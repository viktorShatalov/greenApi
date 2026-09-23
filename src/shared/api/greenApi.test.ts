import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteNotification, receiveNotification, sendMessage } from './greenApi';

const credentials = { idInstance: '12345', apiTokenInstance: 'secret-token' };

describe('greenApi', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends a text message to the normalized chat endpoint', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { idMessage: 'message-1' } });

    await expect(sendMessage(credentials, '79990001122@c.us', 'Привет')).resolves.toEqual({ idMessage: 'message-1' });

    expect(post).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance12345/sendMessage/secret-token',
      { chatId: '79990001122@c.us', message: 'Привет' },
    );
  });

  it('returns incoming notifications from receiveNotification', async () => {
    const notification = {
      receiptId: 7,
      body: {
        typeWebhook: 'incomingMessageReceived',
        senderData: { chatId: '79990001122@c.us' },
        messageData: { textMessageData: { textMessage: 'Ответ' } },
      },
    };
    vi.spyOn(axios, 'get').mockResolvedValue({ data: notification });

    await expect(receiveNotification(credentials)).resolves.toEqual(notification);
  });

  it('deletes a processed notification by receipt id', async () => {
    const remove = vi.spyOn(axios, 'delete').mockResolvedValue({ data: {} });

    await deleteNotification(credentials, 42);

    expect(remove).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance12345/deleteNotification/secret-token/42',
    );
  });

  it('converts API errors to readable messages', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue({
      response: { data: { message: 'Invalid token' } },
      isAxiosError: true,
    });
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    await expect(sendMessage(credentials, 'chat-id', 'Text')).rejects.toThrow('Invalid token');
  });
});
