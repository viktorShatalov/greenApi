import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatPage } from './ChatPage';
import { sendMessage } from '../../shared/api/greenApi';

vi.mock('../../shared/api/greenApi', () => ({
  deleteNotification: vi.fn().mockResolvedValue(undefined),
  receiveNotification: vi.fn(() => new Promise(() => undefined)),
  sendMessage: vi.fn().mockResolvedValue({ idMessage: 'message-1' }),
}));

describe('ChatPage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a validation error when credentials are empty', async () => {
    render(<ChatPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Войти в чат' }));

    await waitFor(() => expect(screen.getByText('Введите idInstance')).toBeInTheDocument());
    expect(screen.getByText('Введите apiTokenInstance')).toBeInTheDocument();
  });

  it('creates a chat from a phone number and sends a text message', async () => {
    render(<ChatPage />);
    fireEvent.change(screen.getByLabelText('ID инстанса'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('API token'), { target: { value: 'token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти в чат' }));

    await waitFor(() => expect(screen.getByText('Выберите чат')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Новый чат'), { target: { value: '+7 (999) 000-11-22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать чат' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: '+79990001122' })).toBeInTheDocument());
    const composer = screen.getByPlaceholderText('Написать сообщение...');
    fireEvent.change(composer, { target: { value: 'Привет' } });
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith(
      { idInstance: '12345', apiTokenInstance: 'token' },
      '79990001122@c.us',
      'Привет',
    ));
    expect(screen.getAllByText('Привет')).toHaveLength(2);
  });

  it('displays a send error returned by the API', async () => {
    vi.mocked(sendMessage).mockRejectedValueOnce(new Error('Ошибка API'));
    render(<ChatPage />);
    fireEvent.change(screen.getByLabelText('ID инстанса'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('API token'), { target: { value: 'token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти в чат' }));
    await waitFor(() => expect(screen.getByText('Выберите чат')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Новый чат'), { target: { value: '79990001122' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать чат' }));
    await waitFor(() => expect(screen.getByPlaceholderText('Написать сообщение...')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Написать сообщение...'), { target: { value: 'Текст' } });
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    await waitFor(() => expect(screen.getByText('Ошибка API')).toBeInTheDocument());
  });
});
