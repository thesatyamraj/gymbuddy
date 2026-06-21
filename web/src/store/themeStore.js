import { create } from 'zustand';

/**
 * Theme store — manages light/dark appearance.
 * Applies the `dark` class to <html> (Tailwind darkMode: 'class')
 * and persists the choice in localStorage. Defaults to dark to match
 * the brand. The no-FOUC script in index.html applies the saved class
 * before paint; this store keeps React state in sync.
 */
const STORAGE_KEY = 'gymbuddy-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // brand default
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  root.style.colorScheme = theme;
  const meta = document.getElementById('meta-theme-color');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  /** Apply the current theme to the DOM (call once on app mount) */
  initTheme: () => {
    const { theme } = get();
    applyTheme(theme);
  },

  /** Switch between light and dark */
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore storage errors */
    }
    set({ theme: next });
  },

  /** Set an explicit theme */
  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
    set({ theme });
  },
}));
