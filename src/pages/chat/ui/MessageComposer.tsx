import { Field, Form } from 'react-final-form';
import type { FormApi } from 'final-form';
import type { MessageFormValues } from '../model';

interface MessageComposerProps {
  chatId: string;
  error: string;
  isSending: boolean;
  onSubmit: (values: MessageFormValues, form: FormApi<MessageFormValues>) => void | Promise<void>;
}

export function MessageComposer({
  chatId,
  error,
  isSending,
  onSubmit,
}: MessageComposerProps) {
  return (
    <Form<MessageFormValues>
      onSubmit={onSubmit}
      initialValues={{ message: '' }}
      render={({ handleSubmit, values }) => (
        <form className="composer" onSubmit={handleSubmit}>
          {error && <div className="composer-error">{error}</div>}
          <Field name="message">
            {({ input }) => (
              <input
                {...input}
                disabled={!chatId}
                placeholder={chatId ? 'Написать сообщение...' : 'Сначала создайте чат'}
                maxLength={4000}
              />
            )}
          </Field>
          <button
            className="send-button"
            type="submit"
            disabled={!chatId || !values.message?.trim() || isSending}
            aria-label="Отправить"
          >
            ➤
          </button>
        </form>
      )}
    />
  );
}
