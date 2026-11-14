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
        navy: {
          950: '#060D1F',
          900: '#0A1633',
          850: '#0E1D40',
          800: '#12234A',
          700: '#1E3A6E',
        },
        surface: {
          DEFAULT: '#0A1633',
          subtle: '#0E1D40',
          elevated: '#12234A',
          border: '#1A2E5A',
        },
        cream: {
          DEFAULT: '#F5EDDC',
          soft: '#C8C0AC',
          muted: '#8A8578',
        },
        coral: {
          DEFAULT: '#FF6F59',
          hover: '#FA5840',
          active: '#E04A33',
          subtle: 'rgba(255, 111, 89, 0.12)',
        },
        severity: {
          critical: '#E11D48',
          high: '#F59E0B',
          medium: '#FACC15',
          low: '#34D399',
          info: '#94A3B8',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        full: '9999px',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
