import type { RefObject } from 'react';
import type { Message } from '../../../entities/message/model';
import { formatTime } from '../lib/helpers';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  chatId: string;
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({ chatId, messages, messagesEndRef }: MessageListProps) {
  return (
    <div className="messages">
      {!chatId ? (
        <EmptyState
          icon="✦"
          title="Начните общение"
          description={<>Введите номер телефона слева,<br />чтобы создать новый чат.</>}
        />
      ) : messages.length === 0 ? (
        <EmptyState
          icon="✉"
          title="Пока нет сообщений"
          description="Напишите первое сообщение собеседнику."
        />
      ) : (
        messages.map((message) => (
          <div className={`message-row ${message.direction}`} key={message.id}>
            <div className="message-bubble">
              {message.text}
              <span className="message-meta">
                {formatTime(message.createdAt)}{' '}
                {message.direction === 'outgoing' && (
                  message.status === 'sent' ? '✓✓' : message.status === 'error' ? '!' : '…'
                )}
              </span>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
