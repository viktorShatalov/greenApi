import { Field, Form } from 'react-final-form';
import type { Message } from '../../../entities/message/model';
import type { NewChatFormValues } from '../model';

interface ChatSidebarProps {
  chatId: string;
  chatTitle: string;
  lastMessage?: Message;
  onLogout: () => void;
  onSelectChat: () => void;
  onSubmit: (values: NewChatFormValues) => void;
  validate: (values: NewChatFormValues) => Partial<Record<keyof NewChatFormValues, string>>;
}

export function ChatSidebar({
  chatId,
  chatTitle,
  lastMessage,
  onLogout,
  onSelectChat,
  onSubmit,
  validate,
}: ChatSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>MAX</span>
        </div>
        <button className="icon-button" onClick={onLogout} aria-label="Выйти">↪</button>
      </div>
      <Form<NewChatFormValues>
        onSubmit={onSubmit}
        initialValues={{ phone: '' }}
        validate={validate}
        render={({ handleSubmit }) => (
          <form className="new-chat-form" onSubmit={handleSubmit}>
            <Field name="phone">
              {({ input, meta }) => (
                <>
                  <label>
                    Новый чат
                    <input {...input} placeholder="+7 900 000-00-00" />
                  </label>
                  {(meta.touched || meta.submitFailed) && meta.error && (
                    <div className="error">{meta.error}</div>
                  )}
                </>
              )}
            </Field>
            <button className="primary-button" type="submit">Создать чат</button>
          </form>
        )}
      />
      {chatId && (
        <button className="chat-preview" onClick={onSelectChat}>
          <span className="avatar">{chatTitle.slice(-2)}</span>
          <span>
            <strong>{chatTitle}</strong>
            <small>{lastMessage?.text || 'Начните переписку'}</small>
          </span>
        </button>
      )}
    </aside>
  );
}
