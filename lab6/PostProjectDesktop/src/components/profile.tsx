import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UPDATE_PROFILE } from '../graphql';
import { errorMessages } from '../format';
import { useAuth } from '../auth/AuthContext';
import { buttonRow, cardTitle, errorList, field, input, mainButton } from '../ui';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSaved(false);

    try {
      const { data } = await updateProfile({ variables: { name, email, phone: phone.trim() || null } });
      if (data) {
        setPhone(data.updateProfile.phone ?? '');
        setSaved(true);
      }
    } catch (err) {
      setErrors(errorMessages(err));
    }
  };

  return (
    <section>
      <h2 className={cardTitle}>Профіль</h2>
      <form onSubmit={handleSubmit} className="max-w-105">
        <div className={field}>
          <label htmlFor="profile-name">Ім'я та прізвище:</label>
          <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={input} />
        </div>
        <div className={field}>
          <label htmlFor="profile-email">Email:</label>
          <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={input} />
        </div>
        <div className={field}>
          <label htmlFor="profile-phone">Номер телефону:</label>
          <input id="profile-phone" type="tel" placeholder="+380 50 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        </div>

        {errors.length > 0 && (
          <ul className={errorList}>
            {errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        )}
        {saved && <p className="mb-[15px] text-success">Дані профілю збережено</p>}

        <div className={buttonRow}>
          <button type="submit" className={mainButton} disabled={loading}>
            {loading ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </section>
  );
}
