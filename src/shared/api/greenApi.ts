import { buildApiUrl } from '../config/api';
import axios from 'axios';
import { runWithGreenApiRateLimit } from './rateLimiter';
import { GREEN_API_TIMEOUT, greenApiClient } from './httpClient';
import type {
  GreenApiErrorResponse,
  GreenCredentials,
  IncomingNotification,
  SendMessageResponse,
} from './model';

export class GreenApiTimeoutError extends Error {
  constructor(cause: unknown) {
    super('GREEN-API не ответил на запрос за 10 секунд', { cause });
    this.name = 'GreenApiTimeoutError';
  }
}

const isGreenApiErrorResponse = (value: unknown): value is GreenApiErrorResponse =>
  typeof value === 'object' &&
  value !== null &&
  ('message' in value || 'error' in value);

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const details = error.response?.data;
    if (isGreenApiErrorResponse(details)) {
      return details.message || details.error || 'GREEN-API не ответил на запрос';
    }
    return 'GREEN-API не ответил на запрос';
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка запроса';
};


export const sendMessage = async (credentials: GreenCredentials, chatId: string, message: string) => {
  try {
    const response = await runWithGreenApiRateLimit(() => greenApiClient.post<SendMessageResponse>(
        buildApiUrl(credentials.idInstance, credentials.apiTokenInstance, 'sendMessage'),
        { chatId, message },
        { timeout: GREEN_API_TIMEOUT },
      ));
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};


export const receiveNotification = async (credentials: GreenCredentials, signal?: AbortSignal) => {
  try {
    const response = await runWithGreenApiRateLimit(() => greenApiClient.get<IncomingNotification | null>(
        buildApiUrl(credentials.idInstance, credentials.apiTokenInstance, 'receiveNotification'),
        {
          signal,
          timeout: GREEN_API_TIMEOUT,
          params: { receiveTimeout: 5 },
        },
      ));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
      return null;
    }

    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new GreenApiTimeoutError(error);
    }

    throw new Error(getErrorMessage(error), { cause: error });
  }
};


export const deleteNotification = async (credentials: GreenCredentials, receiptId: number) => {
  try {
    await runWithGreenApiRateLimit(() => greenApiClient.delete(
        `${buildApiUrl(credentials.idInstance, credentials.apiTokenInstance, 'deleteNotification')}/${receiptId}`,
        { timeout: GREEN_API_TIMEOUT },
      ));
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};
