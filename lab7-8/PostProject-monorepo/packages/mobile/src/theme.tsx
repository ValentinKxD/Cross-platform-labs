import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'light' | 'dark';

export interface Palette {
  header: string;
  nav: string;
  page: string;
  card: string;
  surface: string;
  surfaceSoft: string;
  ink: string;
  heading: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  thead: string;
  theadInk: string;
  grid: string;
  done: string;
  shadow: string;
}

export const palettes: Record<ThemeName, Palette> = {
  light: {
    header: '#BCCCDC',
    nav: '#cfdbe7',
    page: '#D9EAFD',
    card: 'rgba(255, 255, 255, 0.55)',
    surface: '#ffffff',
    surfaceSoft: '#f3f8fe',
    ink: '#000000',
    heading: '#1a3a4a',
    muted: '#4b5563',
    line: '#9db5cd',
    accent: '#1f62d1',
    accentSoft: 'rgba(31, 98, 209, 0.15)',
    danger: '#c62828',
    success: '#1b7a3a',
    thead: '#292f3a',
    theadInk: '#ffffff',
    grid: '#d1d5db',
    done: '#e2e8f0',
    shadow: '#000000',
  },
  dark: {
    header: '#1e293b',
    nav: '#243247',
    page: '#0f172a',
    card: 'rgba(255, 255, 255, 0.05)',
    surface: '#1e293b',
    surfaceSoft: '#172234',
    ink: '#e5e7eb',
    heading: '#dbeafe',
    muted: '#9ca3af',
    line: '#475569',
    accent: '#60a5fa',
    accentSoft: 'rgba(96, 165, 250, 0.2)',
    danger: '#f87171',
    success: '#4ade80',
    thead: '#334155',
    theadInk: '#f1f5f9',
    grid: '#374151',
    done: '#273244',
    shadow: '#000000',
  },
};

export const fonts = {
  title: Platform.select({ ios: 'Courier New', android: 'monospace', default: '"Courier New", Courier, monospace' }),
};

interface ThemeState {
  theme: ThemeName;
  colors: Palette;
  toggleTheme: () => void;
}

const THEME_KEY = 'postproject-theme';

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [theme, setTheme] = useState<ThemeName>(system === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') setTheme(saved);
      })
      .catch(() => undefined);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => undefined);
  };

  const value = useMemo(() => ({ theme, colors: palettes[theme], toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const state = useContext(ThemeContext);
  if (!state) throw new Error('useTheme має використовуватися всередині ThemeProvider');
  return state;
}

export function useStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
