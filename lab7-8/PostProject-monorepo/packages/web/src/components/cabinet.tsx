import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import History from './history';
import Profile from './profile';

type Section = 'profile' | 'history';

const menuButton = 'cursor-pointer px-4 py-[11px] text-left text-[0.95rem] text-ink hover:bg-accent-soft max-[760px]:flex-auto max-[760px]:text-center';

export default function Cabinet({ onCreate, onSignOut }: { onCreate: () => void; onSignOut: () => void }) {
  const { signOut } = useAuth();
  const [section, setSection] = useState<Section>('history');

  const handleSignOut = () => {
    signOut();
    onSignOut();
  };

  const sectionButton = (value: Section) => `${menuButton} ${section === value ? 'bg-surface font-semibold' : ''}`;

  return (
    <div className="grid w-full max-w-250 grid-cols-[190px_1fr] items-start gap-5 max-[760px]:grid-cols-1">
      <aside className="flex flex-col overflow-hidden rounded-xl bg-card shadow-card max-[760px]:flex-row max-[760px]:flex-wrap" aria-label="Розділи кабінету">
        <p className="border-b border-line px-4 py-3 font-semibold max-[760px]:w-full">Особистий кабінет</p>
        <button type="button" className={sectionButton('profile')} onClick={() => setSection('profile')}>Профіль</button>
        <button type="button" className={sectionButton('history')} onClick={() => setSection('history')}>Історія відправлень</button>
        <button type="button" className={menuButton} onClick={onCreate}>Створити накладну</button>
        <button type="button" className={menuButton} onClick={handleSignOut}>Вийти</button>
      </aside>

      <div className="@container min-w-0 rounded-xl bg-card p-6 shadow-card max-sm:px-4 max-sm:py-5">
        {section === 'history' ? <History /> : <Profile />}
      </div>
    </div>
  );
}
