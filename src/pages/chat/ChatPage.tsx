import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { deleteNotification, receiveNotification, sendMessage } from '../../shared/api/greenApi';
import type { GreenCredentials } from '../../shared/api/model';
import type { Message } from '../../entities/message/model';
import './chat.css';

const normalizePhone = (value: string) => value.replace(/\D/g, '');
const formatTime = (timestamp: number) => new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(timestamp);

export function ChatPage() {
  const [credentials, setCredentials] = useState<GreenCredentials | null>(null);
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phone, setPhone] = useState('');
  const [chatId, setChatId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatTitle = useMemo(() => (chatId ? `+${chatId.replace('@c.us', '')}` : 'Новый чат'), [chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!credentials) return;
    const controller = new AbortController();
    let stopped = false;
    const poll = async () => {
      try {
        const notification = await receiveNotification(credentials, controller.signal);
        if (notification && !stopped) {
          const incomingChatId = notification.body.senderData?.chatId;
          const text = notification.body.messageData?.textMessageData?.textMessage;
          if (notification.body.typeWebhook === 'incomingMessageReceived' && incomingChatId && text) {
            setChatId((current) => current || incomingChatId);
            setMessages((current) => [...current, { id: `incoming-${notification.receiptId}`, text, direction: 'incoming', createdAt: Date.now() }]);
          }
          await deleteNotification(credentials, notification.receiptId);
        }
      } catch (pollError) {
        if (!stopped) setError(pollError instanceof Error ? pollError.message : 'Ошибка получения сообщений');
      } finally {
        if (!stopped) void poll();
      }
    };
    void poll();
    return () => { stopped = true; controller.abort(); };
  }, [credentials]);

  const connect = (event: FormEvent) => {
    event.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) { setError('Заполните idInstance и apiTokenInstance'); return; }
    setError('');
    setIsConnecting(true);
    setCredentials({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() });
    window.setTimeout(() => setIsConnecting(false), 400);
  };

  const createChat = (event: FormEvent) => {
    event.preventDefault();
    const normalized = normalizePhone(phone);
    if (normalized.length < 7) { setError('Введите корректный номер телефона'); return; }
    setError('');
    setChatId(`${normalized}@c.us`);
    setMessages([]);
  };

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = messageText.trim();
    if (!credentials || !chatId || !text || isSending) return;
    const localId = `outgoing-${Date.now()}`;
    setMessageText('');
    setIsSending(true);
    setMessages((current) => [...current, { id: localId, text, direction: 'outgoing', createdAt: Date.now(), status: 'sending' }]);
    try {
      await sendMessage(credentials, chatId, text);
      setMessages((current) => current.map((item) => item.id === localId ? { ...item, status: 'sent' } : item));
    } catch (sendError) {
      setMessages((current) => current.map((item) => item.id === localId ? { ...item, status: 'error' } : item));
      setError(sendError instanceof Error ? sendError.message : 'Сообщение не отправлено');
    } finally { setIsSending(false); }
  };

  if (!credentials) return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand"><span className="brand-mark">✦</span><span>MAX</span></div>
        <h1>Подключение к MAX</h1>
        <p className="muted">Введите данные инстанса GREEN-API, чтобы начать переписку.</p>
        <form onSubmit={connect} className="auth-form">
          <label>ID инстанса<input value={idInstance} onChange={(event) => setIdInstance(event.target.value)} placeholder="1101..." /></label>
          <label>API token<input type="password" value={apiTokenInstance} onChange={(event) => setApiTokenInstance(event.target.value)} placeholder="Введите токен" /></label>
          {error && <div className="error">{error}</div>}
          <button className="primary-button" type="submit" disabled={isConnecting}>{isConnecting ? 'Подключение...' : 'Войти в чат'}</button>
        </form>
        <p className="hint">Данные используются только в текущей сессии браузера.</p>
      </section>
    </main>
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header"><div className="brand"><span className="brand-mark">✦</span><span>MAX</span></div><button className="icon-button" onClick={() => setCredentials(null)} aria-label="Выйти">↪</button></div>
        <form className="new-chat-form" onSubmit={createChat}>
          <label>Новый чат<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 900 000-00-00" /></label>
          <button className="primary-button" type="submit">Создать чат</button>
        </form>
        {chatId && <button className="chat-preview" onClick={() => setChatId(chatId)}><span className="avatar">{chatTitle.slice(-2)}</span><span><strong>{chatTitle}</strong><small>{messages.at(-1)?.text || 'Начните переписку'}</small></span></button>}
      </aside>
      <section className="chat">
        <header className="chat-header"><div className="avatar large">{chatId ? chatTitle.slice(-2) : '—'}</div><div><h2>{chatId ? chatTitle : 'Выберите чат'}</h2><span className="online">{chatId ? 'Сообщения MAX' : 'Создайте чат по номеру телефона'}</span></div></header>
        <div className="messages">
          {!chatId ? <div className="empty-state"><div className="empty-icon">✦</div><h3>Начните общение</h3><p>Введите номер телефона слева,<br />чтобы создать новый чат.</p></div> : messages.length === 0 ? <div className="empty-state"><div className="empty-icon">✉</div><h3>Пока нет сообщений</h3><p>Напишите первое сообщение собеседнику.</p></div> : messages.map((message) => <div className={`message-row ${message.direction}`} key={message.id}><div className="message-bubble">{message.text}<span className="message-meta">{formatTime(message.createdAt)} {message.direction === 'outgoing' && (message.status === 'sent' ? '✓✓' : message.status === 'error' ? '!' : '…')}</span></div></div>)}
          <div ref={messagesEndRef} />
        </div>
        <form className="composer" onSubmit={submitMessage}>
          {error && <div className="composer-error">{error}</div>}
          <input value={messageText} onChange={(event) => setMessageText(event.target.value)} disabled={!chatId} placeholder={chatId ? 'Написать сообщение...' : 'Сначала создайте чат'} maxLength={4000} />
          <button className="send-button" type="submit" disabled={!chatId || !messageText.trim() || isSending} aria-label="Отправить">➤</button>
        </form>
      </section>
    </main>
  );
}
