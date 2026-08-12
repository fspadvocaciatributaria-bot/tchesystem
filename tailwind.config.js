/** @type {import('tailwindcss').Config} */
// Tokens de design semânticos com suporte a tema claro/escuro via CSS variables.
// As variáveis são definidas em src/index.css (:root = dark, .light = claro).
// Paleta: preto/branco (superfícies) · vermelho (crítico) · dourado (lucro/premium) · cinza.
const withVar = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: withVar('--bg'),
          soft: withVar('--surface'),
          card: withVar('--card'),
          border: withVar('--border'),
        },
        strong: withVar('--strong'), // texto forte (títulos) — antes era text-white
        muted: {
          DEFAULT: withVar('--muted'),
          soft: withVar('--muted-soft'),
        },
        gold: {
          DEFAULT: '#d4af37',
          soft: '#e8c766',
          dark: '#a8841f',
        },
        critical: {
          DEFAULT: '#e5352b',
          soft: '#ff6b63',
          dark: '#a81f18',
        },
        success: {
          DEFAULT: '#2fbf71',
          soft: '#5fd699',
        },
        warning: {
          DEFAULT: '#e0a92e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
