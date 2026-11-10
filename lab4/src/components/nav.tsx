import { useEffect, useState } from 'react';

export type Page = 'home' | 'create' | 'cabinet';

type Theme = 'light' | 'dark';

const THEME_KEY = 'postproject-theme';

const LINKS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Головна' },
  { page: 'create', label: 'Створити накладну' },
  { page: 'cabinet', label: 'Особистий кабінет' },
];

function savedTheme(): string | null {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function initialTheme(): Theme {
  const saved = savedTheme();
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Nav({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  return (
    <nav className="relative flex items-center justify-center bg-nav px-15 py-2 max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:gap-2 max-sm:px-3">
      <ul className="flex flex-wrap justify-center gap-1.5 max-sm:grid max-sm:grid-cols-3 max-sm:gap-1">
        {LINKS.map((link) => (
          <li key={link.page} className="max-sm:flex">
            <button
              type="button"
              className={`cursor-pointer rounded-md border px-3.5 py-[7px] text-[0.95rem] text-ink hover:border-line max-sm:min-h-11 max-sm:w-full max-sm:px-1.5 max-sm:py-1 max-sm:text-[0.85rem] max-sm:leading-tight ${
                page === link.page ? 'border-line bg-surface font-semibold' : 'border-transparent'
              }`}
              aria-current={page === link.page ? 'page' : undefined}
              onClick={() => onNavigate(link.page)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink max-sm:static max-sm:size-10 max-sm:translate-y-0"
        aria-label={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    </nav>
  );
}
