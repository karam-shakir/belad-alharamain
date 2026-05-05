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
        gold: {
          DEFAULT: '#A88B4A',
          50:  '#FBF7EE',
          100: '#F4EBD3',
          200: '#E8D3A7',
          300: '#DABC7B',
          400: '#CDA85A',
          500: '#A88B4A',
          600: '#876F3A',
          700: '#64522B',
          800: '#42361C',
          900: '#211B0E',
          light: '#C4A55E',
          dark:  '#7D6530',
        },
        teal: {
          DEFAULT: '#1F7A8C',
          50:  '#EBF7FA',
          100: '#CAEAF1',
          200: '#95D4E3',
          300: '#60BFD5',
          400: '#2BAAC7',
          500: '#1F7A8C',
          600: '#186070',
          700: '#114754',
          800: '#0B2E37',
          900: '#06171C',
          light: '#2A9DB5',
          dark:  '#155E6B',
        },
        cream: {
          DEFAULT: '#FAFAF7',
          dark:    '#F2EDE1',
        },
      },
      fontFamily: {
        cairo:  ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        poppins:['var(--font-poppins)', 'Poppins', 'sans-serif'],
        sans:   ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      animation: {
        'fade-up':      'fadeUp 0.7s ease forwards',
        'fade-down':    'fadeDown 0.6s ease forwards',
        'fade-in':      'fadeIn 0.6s ease forwards',
        'slide-in-r':   'slideInRight 0.7s ease forwards',
        'slide-in-l':   'slideInLeft 0.7s ease forwards',
        'float':        'float 3s ease-in-out infinite',
        'pulse-ring':   'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'shimmer':      'shimmer 2.5s ease-in-out infinite',
        'bounce-slow':  'bounceSlow 2s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'count-up':     'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(37,211,102,0.5)' },
          '70%':  { boxShadow: '0 0 0 15px rgba(37,211,102,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37,211,102,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(6px)' },
        },
      },
      boxShadow: {
        'gold':    '0 4px 24px rgba(168,139,74,0.25)',
        'gold-lg': '0 8px 40px rgba(168,139,74,0.35)',
        'teal':    '0 4px 24px rgba(31,122,140,0.25)',
        'teal-lg': '0 8px 40px rgba(31,122,140,0.35)',
        'card':    '0 2px 20px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        'islamic-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 5L45.7 26.1L64.7 15.3L53.9 34.3L75 40L53.9 45.7L64.7 64.7L45.7 53.9L40 75L34.3 53.9L15.3 64.7L26.1 45.7L5 40L26.1 34.3L15.3 15.3L34.3 26.1Z' fill='none' stroke='%23A88B4A' stroke-width='0.6' opacity='0.12'/%3E%3Ccircle cx='40' cy='40' r='5' fill='none' stroke='%23A88B4A' stroke-width='0.4' opacity='0.08'/%3E%3C/svg%3E\")",
        'teal-gradient':   'linear-gradient(160deg, #0D3D4A 0%, #1F7A8C 50%, #155E6B 100%)',
        'gold-gradient':   'linear-gradient(135deg, #7D6530 0%, #A88B4A 50%, #C4A55E 100%)',
        'hero-overlay':    'linear-gradient(160deg, rgba(6,25,30,0.93) 0%, rgba(15,55,65,0.87) 50%, rgba(5,18,22,0.95) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
