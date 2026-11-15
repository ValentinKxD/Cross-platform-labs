import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN } from '../graphql';
import { errorMessages } from '../format';
import { useAuth } from '../auth/AuthContext';
import Modal from './modal';
import RegisterForm from './registerForm';
import { buttonRow, checkbox, checkboxLabel, field, fieldError, hint, input, linkButton, mainButton } from '../ui';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMutation, { loading }] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await loginMutation({ variables: { login, password, remember } });
      if (data) signIn(data.login.token, data.login.user, remember);
    } catch (err) {
      setError(errorMessages(err)[0]);
    }
  };

  if (mode === 'register') {
    return (
      <Modal title="Реєстрація" onClose={onClose}>
        <RegisterForm onShowLogin={() => setMode('login')} />
      </Modal>
    );
  }

  return (
    <Modal title="Вхід до особистого кабінету" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className={field}>
          <label htmlFor="login">Email або номер телефону:</label>
          <input
            id="login"
            type="text"
            autoComplete="username"
            placeholder="user@example.com"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            autoFocus
            className={input}
          />
        </div>

        <div className={field}>
          <label htmlFor="password">Пароль:</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={input}
            aria-invalid={error !== null}
          />
          {error && <p className={fieldError}>{error}</p>}
        </div>

        <label className={checkboxLabel}>
          <input type="checkbox" className={checkbox} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Запам'ятати мене
        </label>

        <div className={buttonRow}>
          <button type="submit" className={`${mainButton} mb-3!`} disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </div>

        <p className="mb-2 text-center">
          <button type="button" className={linkButton} onClick={() => setShowHint(true)}>Забули пароль?</button>
        </p>
        {showHint && (
          <p className={`${hint} text-center`}>Відновлення пароля поки недоступне. Зверніться до служби підтримки PostProject.</p>
        )}

        <p className="mt-3 mb-2 border-t border-grid pt-3 text-center">
          Немає облікового запису? <button type="button" className={linkButton} onClick={() => setMode('register')}>Зареєструватися</button>
        </p>
      </form>
    </Modal>
  );
}
