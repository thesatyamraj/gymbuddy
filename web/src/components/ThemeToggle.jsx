import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

/**
 * Light / dark theme toggle button.
 * `variant="icon"` renders a compact circular button (for navbars/headers).
 */
export default function ThemeToggle({ className = '', variant = 'icon' }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  if (variant === 'ghost') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors ${className}`}
      >
        <Sun
          className={`w-5 h-5 absolute transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-surface text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${className}`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="text-sm font-semibold">{isDark ? 'Light' : 'Dark'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-10 h-10 rounded-xl border border-slate-200 bg-surface text-slate-500 hover:text-primary-500 hover:border-primary-300 flex items-center justify-center transition-all ${className}`}
    >
      <Sun
        className={`w-5 h-5 absolute transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
      <Moon
        className={`w-5 h-5 absolute transition-all duration-300 ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
    </button>
  );
}
