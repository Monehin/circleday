import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Celebration palette
        celebration: {
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD1BF',
          300: '#FFB49D',
          400: '#FF976B',
          500: '#FF7A39',
          600: '#E66027',
          700: '#BF4A1A',
          800: '#993813',
          900: '#73290E',
          950: '#5C1A0F',
        },
        warmth: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        depth: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        display: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
        lifted: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        floating: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config

