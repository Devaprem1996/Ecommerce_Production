import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '375px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
    },
    extend: {
      colors: {
        primary: {
          100: '#D8F3DC',
          200: '#B7E4C7',
          250: '#95D5B2',
          300: '#74C69D',
          400: '#52B788',
          500: '#2D6A4F',
          600: '#204E37',
          700: '#1B4332',
          750: '#143527',
          800: '#081C15',
          900: '#0B251A',
          DEFAULT: '#2D6A4F',
          dark: '#1B4332',
          light: '#52B788',
        },
        secondary: {
          400: '#E09F3E', // Stars, premium feel
          600: '#F77F00', // Add to Cart, urgency
          gold: '#E09F3E',
          orange: '#F77F00',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          150: '#E9ECEF',
          200: '#E2E8F0',
          250: '#DEE2E6',
          300: '#CBD5E1',
          400: '#CED4DA',
          450: '#ADB5BD',
          500: '#6C757D',
          600: '#6C757D',
          650: '#495057',
          700: '#343A40',
          750: '#2C302E',
          800: '#212529',
          850: '#1A1D20',
          900: '#212529',
          905: '#0F111A',
          950: '#08090C',
        },
        success: '#28A745', // In stock, order confirmed
        warning: '#FFC107', // Low stock, alerts
        error: '#DC3545', // Out of stock, errors
        info: '#17A2B8', // Delivery info, tips
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        heading: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        tamil: ['var(--font-tamil)', 'Noto Sans Tamil', 'sans-serif'],
      },
      spacing: {
        grid: '8px',
      },
      borderRadius: {
        card: '8px',
        feature: '12px',
        badge: '9999px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '600ms',
      },
      animation: {
        'fade-up': 'fadeUp 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'fade-out': 'fadeOut 200ms ease-out forwards',
        'scale-bounce': 'scaleBounce 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'ken-burns': 'kenBurns 15s infinite ease-in-out',
        'slide-in-right': 'slideInRight 300ms ease-out forwards',
        'shake': 'shake 500ms ease-in-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleBounce: {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1.0)' },
        },
        kenBurns: {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%': { transform: 'scale(1.1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
