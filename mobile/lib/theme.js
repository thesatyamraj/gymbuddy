import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme, vars } from 'nativewind';

/**
 * Mobile theme system (light / dark).
 *
 * - `Colors` is a live palette object used for INLINE color props
 *   (icon `color=`, inline `style` colors). It is mutated in place when
 *   the theme changes; the root layout remounts the tree (key={theme})
 *   so screens re-read the new values.
 * - className colors (bg-slate-*, text-primary-*, bg-surface …) are themed
 *   automatically through NativeWind + the CSS variables in global.css,
 *   driven by `colorScheme.set()`.
 */

const STORAGE_KEY = 'gymbuddy-theme';

const LIGHT = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceRaised: '#ffffff',
  sunken: '#f1f5f9',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  iconFaint: '#94a3b8',
  textMuted: '#64748b',
  textBody: '#475569',
  textStrong: '#334155',
  textSecondary: '#1e293b',
  text: '#0f172a',
  primarySurface: '#fdf0ef',
  primarySurface2: '#fbdad8',
  primary200: '#f6b5b1',
  primary300: '#ef8a84',
  primaryLight: '#e9655e',
  brand: '#e24b4a',
  primary: '#d63a39',
  primaryDark: '#b82e2d',
  primary800: '#962826',
  primary900: '#7c2625',
  roseSurface: '#fff1f2',
  roseSurface2: '#ffe4e6',
  emeraldSurface: '#ecfdf5',
  emeraldSurface2: '#d1fae5',
  // theme-invariant accents
  rose: '#f43f5e',
  roseDark: '#e11d48',
  roseLight: '#fda4af',
  emerald: '#10b981',
  emeraldDark: '#059669',
  green500: '#22c55e',
  green400: '#4ade80',
  error: '#ef4444',
  error400: '#f87171',
  white: '#ffffff',
  black: '#000000',
};

const DARK = {
  bg: '#0b0b0c',
  surface: '#161618',
  surfaceRaised: '#1d1d20',
  sunken: '#161617',
  border: '#262627',
  borderStrong: '#33333a',
  iconFaint: '#8a8a90',
  textMuted: '#a8a8a8',
  textBody: '#c2c2c4',
  textStrong: '#d8d8da',
  textSecondary: '#ececec',
  text: '#f1f1f1',
  primarySurface: '#2b1311',
  primarySurface2: '#3d1916',
  primary200: '#5a2421',
  primary300: '#86332f',
  primaryLight: '#f0726a',
  brand: '#e24b4a',
  primary: '#dc3f3e',
  primaryDark: '#c43534',
  primary800: '#9e2a29',
  primary900: '#7a2120',
  roseSurface: '#2a1216',
  roseSurface2: '#3a1820',
  emeraldSurface: '#0f2018',
  emeraldSurface2: '#13301f',
  // theme-invariant accents
  rose: '#f43f5e',
  roseDark: '#e11d48',
  roseLight: '#fda4af',
  emerald: '#10b981',
  emeraldDark: '#059669',
  green500: '#22c55e',
  green400: '#4ade80',
  error: '#ef4444',
  error400: '#f87171',
  white: '#ffffff',
  black: '#000000',
};

export const PALETTES = { light: LIGHT, dark: DARK };

// Live palette — start on dark (brand default). Mutated in place on change.
export const Colors = { ...DARK };

// Default NativeWind to dark on load (brand default); hydrate() may switch it.
try {
  colorScheme.set('dark');
} catch {
  /* no-op */
}

const applyPalette = (theme) => {
  const p = theme === 'light' ? LIGHT : DARK;
  Object.assign(Colors, p);
  try {
    colorScheme.set(theme); // drives NativeWind className theming
  } catch {
    /* no-op */
  }
};

export const useThemeStore = create((set, get) => ({
  theme: 'dark',
  hydrated: false,

  /** Load the saved theme from storage on app start */
  hydrate: async () => {
    let theme = 'dark';
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') theme = saved;
    } catch {
      /* ignore */
    }
    applyPalette(theme);
    set({ theme, hydrated: true });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyPalette(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    set({ theme: next });
  },

  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    applyPalette(theme);
    AsyncStorage.setItem(STORAGE_KEY, theme).catch(() => {});
    set({ theme });
  },
}));

/* ─── NativeWind CSS-variable theme styles ───────────────────────────
   Applied via `vars()` on a root <View> so className colors
   (bg-slate-*, text-slate-*, bg-surface, bg-primary-*, …) cascade and
   switch reliably with the theme. */
const LIGHT_VARS = {
  '--slate-50': '248 250 252',
  '--slate-100': '241 245 249',
  '--slate-200': '226 232 240',
  '--slate-300': '203 213 225',
  '--slate-400': '148 163 184',
  '--slate-500': '100 116 139',
  '--slate-600': '71 85 105',
  '--slate-700': '51 65 85',
  '--slate-800': '30 41 59',
  '--slate-900': '15 23 42',
  '--slate-950': '2 6 23',
  '--primary-50': '253 240 239',
  '--primary-100': '251 218 216',
  '--primary-200': '246 181 177',
  '--primary-300': '239 138 132',
  '--primary-400': '233 101 94',
  '--primary-500': '226 75 74',
  '--primary-600': '214 58 57',
  '--primary-700': '184 46 45',
  '--primary-800': '150 40 38',
  '--primary-900': '124 38 37',
  '--primary-950': '67 15 14',
  '--surface': '255 255 255',
  '--surface-raised': '255 255 255',
  '--surface-sunken': '241 245 249',
  '--surface-border': '226 232 240',
  '--ink': '255 255 255',
  '--rose': '244 63 94',
  '--rose-dark': '225 29 72',
  '--rose-light': '253 164 175',
};

const DARK_VARS = {
  '--slate-50': '11 11 12',
  '--slate-100': '22 22 23',
  '--slate-200': '38 38 39',
  '--slate-300': '51 51 58',
  '--slate-400': '138 138 144',
  '--slate-500': '168 168 168',
  '--slate-600': '194 194 196',
  '--slate-700': '216 216 218',
  '--slate-800': '236 236 236',
  '--slate-900': '241 241 241',
  '--slate-950': '255 255 255',
  '--primary-50': '43 19 17',
  '--primary-100': '61 25 22',
  '--primary-200': '90 36 33',
  '--primary-300': '134 51 47',
  '--primary-400': '240 114 106',
  '--primary-500': '226 75 74',
  '--primary-600': '220 63 62',
  '--primary-700': '196 53 52',
  '--primary-800': '158 42 41',
  '--primary-900': '122 33 32',
  '--primary-950': '43 19 17',
  '--surface': '22 22 24',
  '--surface-raised': '29 29 32',
  '--surface-sunken': '16 16 18',
  '--surface-border': '38 38 41',
  '--ink': '10 10 10',
  '--rose': '244 63 94',
  '--rose-dark': '225 29 72',
  '--rose-light': '253 164 175',
};

export const THEME_VARS = {
  light: vars(LIGHT_VARS),
  dark: vars(DARK_VARS),
};
