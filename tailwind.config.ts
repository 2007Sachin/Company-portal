import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#627d98',
          500: '#486581',
          600: '#1e293b',
          700: '#172033',
          800: '#11182a',
          900: '#0b1120',
          950: '#060a14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // 1.25 modular scale from 16px base
        'xs': ['0.75rem', { lineHeight: '1.5' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],    // 14px
        'base': ['1rem', { lineHeight: '1.5' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.5' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.3' }],     // 20px
        '2xl': ['1.563rem', { lineHeight: '1.3' }],   // 25px
        '3xl': ['1.953rem', { lineHeight: '1.2' }],   // ~31px
        '4xl': ['2.441rem', { lineHeight: '1.2' }],   // ~39px
        '5xl': ['3.052rem', { lineHeight: '1.1' }],   // ~49px
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'chip': '6px',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'score-fill': 'score-fill 1.2s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'score-fill': {
          from: { strokeDashoffset: '283' },
          to: { strokeDashoffset: 'var(--score-offset)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
