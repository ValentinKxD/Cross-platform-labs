import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { REGISTER } from '../graphql';
import { errorMessages } from '../format';
import { useAuth } from '../auth/AuthContext';
import { buttonRow, errorList, field, hint, input, linkButton, mainButton } from '../ui';

export default function RegisterForm({ onShowLogin }: { onShowLogin: () => void }) {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [register, { loading }] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordRepeat) {
      setErrors(['Паролі не збігаються']);
      return;
    }

    setErrors([]);
    try {
      const { data } = await register({ variables: { name, email, phone: phone.trim() || null, password } });
      if (data) signIn(data.register.token, data.register.user, false);
    } catch (err) {
      setErrors(errorMessages(err));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={field}>
        <label htmlFor="register-name">Ім'я та прізвище:</label>
        <input id="register-name" type="text" autoComplete="name" placeholder="Ім'я Прізвище" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className={input} />
      </div>

      <div className={field}>
        <label htmlFor="register-email">Email:</label>
        <input id="register-email" type="email" autoComplete="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={input} />
      </div>

      <div className={field}>
        <label htmlFor="register-phone">Номер телефону:</label>
        <input id="register-phone" type="tel" autoComplete="tel" placeholder="+380 50 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        <p className={hint}>Необов'язково. За номером телефону теж можна буде входити.</p>
      </div>

      <div className={field}>
        <label htmlFor="register-password">Пароль:</label>
        <input id="register-password" type="password" autoComplete="new-password" placeholder="Щонайменше 6 символів" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required className={input} />
      </div>

      <div className={field}>
        <label htmlFor="register-password-repeat">Повторіть пароль:</label>
        <input id="register-password-repeat" type="password" autoComplete="new-password" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} required className={input} aria-invalid={errors.length > 0} />
      </div>

      {errors.length > 0 && (
        <ul className={errorList}>
          {errors.map((message) => <li key={message}>{message}</li>)}
        </ul>
      )}

      <div className={buttonRow}>
        <button type="submit" className={`${mainButton} mb-3!`} disabled={loading}>
          {loading ? 'Реєстрація...' : 'Зареєструватися'}
        </button>
      </div>

      <p className="mb-2 text-center">
        Вже маєте обліковий запис? <button type="button" className={linkButton} onClick={onShowLogin}>Увійти</button>
      </p>
    </form>
  );
}
