import type { AuthFormValues, NewChatFormValues } from '../model';

export const normalizePhone = (value: string) => value.replace(/\D/g, '');

export const formatTime = (timestamp: number) => new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
}).format(timestamp);

export const formatChatTitle = (chatId: string) =>
  chatId ? `+${chatId.replace('@c.us', '')}` : 'Новый чат';

export const validateAuthForm = (values: AuthFormValues) => {
  const errors: Partial<Record<keyof AuthFormValues, string>> = {};

  if (!values.idInstance.trim()) errors.idInstance = 'Введите idInstance';
  if (!values.apiTokenInstance.trim()) errors.apiTokenInstance = 'Введите apiTokenInstance';

  return errors;
};

export const validateNewChatForm = (values: NewChatFormValues) =>
  normalizePhone(values.phone).length < 7
    ? { phone: 'Введите корректный номер телефона' }
    : {};
