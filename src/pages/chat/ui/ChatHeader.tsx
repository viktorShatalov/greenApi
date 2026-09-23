interface ChatHeaderProps {
  chatId: string;
  chatTitle: string;
}

export function ChatHeader({ chatId, chatTitle }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="avatar large">{chatId ? chatTitle.slice(-2) : '—'}</div>
      <div>
        <h2>{chatId ? chatTitle : 'Выберите чат'}</h2>
        <span className="online">
          {chatId ? 'Сообщения MAX' : 'Создайте чат по номеру телефона'}
        </span>
      </div>
    </header>
  );
}
