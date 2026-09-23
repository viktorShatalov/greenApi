import { Field, Form } from 'react-final-form';
import type { AuthFormValues } from '../model';

interface AuthFormProps {
  error: string;
  isConnecting: boolean;
  onSubmit: (values: AuthFormValues) => void;
  validate: (values: AuthFormValues) => Partial<Record<keyof AuthFormValues, string>>;
}

export function AuthForm({ error, isConnecting, onSubmit, validate }: AuthFormProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>MAX</span>
        </div>
        <h1>Подключение к MAX</h1>
        <p className="muted">Введите данные инстанса GREEN-API, чтобы начать переписку.</p>
        <Form<AuthFormValues>
          onSubmit={onSubmit}
          initialValues={{ idInstance: '', apiTokenInstance: '' }}
          validate={validate}
          render={({ handleSubmit, submitting }) => (
            <form onSubmit={handleSubmit} className="auth-form">
              <Field name="idInstance">
                {({ input, meta }) => (
                  <>
                    <label>
                      ID инстанса
                      <input {...input} placeholder="1101..." />
                    </label>
                    {(meta.touched || meta.submitFailed) && meta.error && (
                      <div className="error">{meta.error}</div>
                    )}
                  </>
                )}
              </Field>
              <Field name="apiTokenInstance">
                {({ input, meta }) => (
                  <>
                    <label>
                      API token
                      <input {...input} type="password" placeholder="Введите токен" />
                    </label>
                    {(meta.touched || meta.submitFailed) && meta.error && (
                      <div className="error">{meta.error}</div>
                    )}
                  </>
                )}
              </Field>
              {error && <div className="error">{error}</div>}
              <button className="primary-button" type="submit" disabled={isConnecting || submitting}>
                {isConnecting ? 'Подключение...' : 'Войти в чат'}
              </button>
            </form>
          )}
        />
        <p className="hint">Данные используются только в текущей сессии браузера.</p>
      </section>
    </main>
  );
}
