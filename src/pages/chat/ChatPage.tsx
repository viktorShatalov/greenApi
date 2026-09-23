import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormApi } from 'final-form';
import type { GreenCredentials } from '../../shared/api/model';
import type { Message } from '../../entities/message/model';
import { sendChatMessageSafely, startIncomingMessagesPolling } from './lib/chatApi';
import {
  formatChatTitle,
  normalizePhone,
  validateAuthForm,
  validateNewChatForm,
} from './lib/helpers';
import type { AuthFormValues, MessageFormValues, NewChatFormValues } from './model';
import { AuthForm } from './ui/AuthForm';
import { ChatHeader } from './ui/ChatHeader';
import { ChatSidebar } from './ui/ChatSidebar';
import { MessageComposer } from './ui/MessageComposer';
import { MessageList } from './ui/MessageList';
import './chat.css';

export function ChatPage() {
  const [credentials, setCredentials] = useState<GreenCredentials | null>(null);
  const [chatId, setChatId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatTitle = useMemo(() => formatChatTitle(chatId), [chatId]);

  const submitAuthForm = (values: AuthFormValues) => {
    setError('');
    setIsConnecting(true);
    setCredentials({
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
    });
    window.setTimeout(() => setIsConnecting(false), 400);
  };

  const submitNewChatForm = (values: NewChatFormValues) => {
    setError('');
    setChatId(`${normalizePhone(values.phone)}@c.us`);
    setMessages([]);
  };

  const submitMessageForm = async (
    { message }: MessageFormValues,
    form: FormApi<MessageFormValues>,
  ) => {
    const text = message.trim();

    if (!credentials || !chatId || !text || isSending) return;

    const localId = `outgoing-${Date.now()}`;
    form.reset();
    setIsSending(true);
    setMessages((current) => [
      ...current,
      {
        id: localId,
        text,
        direction: 'outgoing',
        createdAt: Date.now(),
        status: 'sending',
      },
    ]);

    const result = await sendChatMessageSafely(credentials, chatId, text);

    if (result.ok) {
      setMessages((current) => current.map((item) => (
        item.id === localId ? { ...item, status: 'sent' } : item
      )));
    } else {
      setMessages((current) => current.map((item) => (
        item.id === localId ? { ...item, status: 'error' } : item
      )));
      setError(result.error ?? 'Сообщение не отправлено');
    }

    setIsSending(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!credentials) return;

    return startIncomingMessagesPolling(credentials, {
      onMessage: (message) => {
        setChatId((current) => current || message.chatId);
        setMessages((current) => [...current, {
          id: message.id,
          text: message.text,
          direction: 'incoming',
          createdAt: message.createdAt,
        }]);
      },
      onError: (pollError) => setError(pollError.message),
    });
  }, [credentials]);

  if (!credentials) {
    return (
      <AuthForm
        error={error}
        isConnecting={isConnecting}
        onSubmit={submitAuthForm}
        validate={validateAuthForm}
      />
    );
  }

  return (
    <main className="app-shell">
      <ChatSidebar
        chatId={chatId}
        chatTitle={chatTitle}
        lastMessage={messages.at(-1)}
        onLogout={() => setCredentials(null)}
        onSelectChat={() => setChatId(chatId)}
        onSubmit={submitNewChatForm}
        validate={validateNewChatForm}
      />
      <section className="chat">
        <ChatHeader chatId={chatId} chatTitle={chatTitle} />
        <MessageList
          chatId={chatId}
          messages={messages}
          messagesEndRef={messagesEndRef}
        />
        <MessageComposer
          chatId={chatId}
          error={error}
          isSending={isSending}
          onSubmit={submitMessageForm}
        />
      </section>
    </main>
  );
}
