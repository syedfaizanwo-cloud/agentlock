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
          800: '#12234A',
        },
        'shadow-dark': '#030714',
        cream: {
          DEFAULT: '#F5EDDC',
          soft: '#C8C0AC',
        },
        coral: {
          DEFAULT: '#FF6F59',
          pressed: '#E85A44',
          soft: 'rgba(255, 111, 89, 0.16)',
        },
        severity: {
          critical: '#E11D48',
          high: '#F59E0B',
          medium: '#FACC15',
          low: '#34D399',
          info: '#94A3B8',
        },
      },
      boxShadow: {
        'raised-sm': '4px 4px 8px #030714, -4px -4px 8px #12234A',
        'raised-md': '8px 8px 16px #030714, -8px -8px 16px #12234A',
        'raised-lg': '14px 14px 28px #030714, -14px -14px 28px #12234A',
        'inset-sm': 'inset 3px 3px 6px #030714, inset -3px -3px 6px #12234A',
        'inset-md': 'inset 6px 6px 12px #030714, inset -6px -6px 12px #12234A',
      },
      borderRadius: {
        card: '14px',
        control: '10px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
