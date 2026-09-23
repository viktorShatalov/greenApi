import axios from 'axios';
import { buildApiUrl } from '../config/api';
import type {
  GreenApiErrorResponse,
  GreenCredentials,
  IncomingNotification,
  SendMessageResponse,
} from './model';

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
    const response = await axios.post<SendMessageResponse>(
      buildApiUrl(credentials.idInstance, credentials.apiTokenInstance, 'sendMessage'),
      { chatId, message },
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};


export const receiveNotification = async (credentials: GreenCredentials, signal?: AbortSignal) => {
  try {
    const response = await axios.get<IncomingNotification | null>(
      buildApiUrl(credentials.idInstance, credentials.apiTokenInstance, 'receiveNotification'),
      { signal, timeout: 30000 },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED')) {
      return null;
    }
    throw new Error(getErrorMessage(error), { cause: error });
  }
};


export const deleteNotification = async (credentials: GreenCredentials, receiptId: number) => {
  try {
    await axios.delete(
      `${buildApiUrl(credentials.idInstance, credentials.apiTokenInstance, 'deleteNotification')}/${receiptId}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};
