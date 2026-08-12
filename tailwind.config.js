/** @type {import('tailwindcss').Config} */
// Tokens de design semânticos (ver docs/ARCHITECTURE.md §UI e CLAUDE.md).
// Paleta: preto / preto fosco / vermelho / dourado / cinza. Cores via CSS variables
// para permitir tema futuro. Vermelho = crítico; dourado = lucro/metas/premium.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // superfícies
        ink: {
          DEFAULT: '#0a0a0b', // preto
          soft: '#141416', // preto fosco
          card: '#1b1b1f',
          border: '#2a2a30',
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
        muted: {
          DEFAULT: '#8a8a92',
          soft: '#b4b4bc',
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
