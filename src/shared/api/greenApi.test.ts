import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  deleteNotification,
  GreenApiTimeoutError,
  receiveNotification,
  sendMessage,
} from './greenApi';
import { greenApiClient } from './httpClient';

const credentials = { idInstance: '12345', apiTokenInstance: 'secret-token' };

describe('greenApi', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends a text message to the normalized chat endpoint', async () => {
    const post = vi.spyOn(greenApiClient, 'post').mockResolvedValue({ data: { idMessage: 'message-1' } });

    await expect(sendMessage(credentials, '79990001122@c.us', 'Привет')).resolves.toEqual({ idMessage: 'message-1' });

    expect(post).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance12345/sendMessage/secret-token',
      { chatId: '79990001122@c.us', message: 'Привет' },
      { timeout: 10_000 },
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
    vi.spyOn(greenApiClient, 'get').mockResolvedValue({ data: notification });

    await expect(receiveNotification(credentials)).resolves.toEqual(notification);
  });

  it('deletes a processed notification by receipt id', async () => {
    const remove = vi.spyOn(greenApiClient, 'delete').mockResolvedValue({ data: {} });

    await deleteNotification(credentials, 42);

    expect(remove).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance12345/deleteNotification/secret-token/42',
      { timeout: 10_000 },
    );
  });

  it('converts API errors to readable messages', async () => {
    vi.spyOn(greenApiClient, 'post').mockRejectedValue({
      response: { data: { message: 'Invalid token' } },
      isAxiosError: true,
    });
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    await expect(sendMessage(credentials, 'chat-id', 'Text')).rejects.toThrow('Invalid token');
  });

  it('stops waiting after the ten-second API timeout', async () => {
    vi.spyOn(greenApiClient, 'get').mockRejectedValue({
      code: 'ECONNABORTED',
      isAxiosError: true,
    });
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    await expect(receiveNotification(credentials)).rejects.toBeInstanceOf(GreenApiTimeoutError);
  });
});
