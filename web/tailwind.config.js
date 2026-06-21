/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const ramp = (fam) =>
  Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [k, v(`${fam}-${k}`)]));

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: ramp('primary'),
        slate: ramp('slate'),
        surface: {
          DEFAULT: v('surface'),
          raised: v('surface-raised'),
          sunken: v('surface-sunken'),
          border: v('surface-border'),
        },
        ink: v('ink'),
        accent: {
          rose: v('rose'),
          roseDark: v('rose-dark'),
          roseLight: v('rose-light'),
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Barlow Condensed', 'Oswald', 'Inter', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { tightest: '-0.04em' },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'confetti': 'confetti 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        bounceIn: { '0%': { opacity: '0', transform: 'scale(0.3)' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        confetti: { '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' }, '100%': { transform: 'translateY(600px) rotate(720deg)', opacity: '0' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
      },
      boxShadow: {
        'card': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.22)',
        'glow': '0 0 40px rgba(226, 75, 74, 0.35)',
        'glow-strong': '0 0 60px rgba(226, 75, 74, 0.5)',
      },
    },
  },
  plugins: [],
};
