/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FFFDF7',
          100: '#FFF8E7',
          200: '#FAF3E0',
          300: '#F5E6C8',
          400: '#EDD9AA',
        },
        peach: {
          100: '#FFE5DC',
          200: '#FFD0C2',
          300: '#FFB7A5',
          400: '#FF9E8A',
          500: '#FF8070',
        },
        lavender: {
          100: '#EDE0F5',
          200: '#DCCBEB',
          300: '#CDB4DB',
          400: '#B99FC9',
          500: '#A588B8',
        },
        sky: {
          100: '#D6ECFF',
          200: '#BDE0FF',
          300: '#A2D2FF',
          400: '#7ABFFF',
          500: '#52ABFF',
        },
        mint: {
          100: '#D8F0DE',
          200: '#CBE8D3',
          300: '#BDE0C9',
          400: '#9DD0AC',
          500: '#7DC090',
        },
        orange: {
          400: '#FF9F5A',
          500: '#FF8C42',
          600: '#F07028',
        },
        purple: {
          400: '#9D87FF',
          500: '#7B61FF',
          600: '#5E44E8',
        },
        ink: {
          900: '#1A1A2E',
          800: '#2D2D44',
          700: '#3D3D55',
          600: '#555566',
          500: '#666680',
          400: '#8888A0',
          300: '#AAAABC',
        },
      },
      fontFamily: {
        sans:    ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      boxShadow: {
        'card':    '0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        'card-md': '0 4px 24px rgba(0,0,0,0.10), 0 1px 6px rgba(0,0,0,0.05)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'orange':  '0 4px 20px rgba(255,140,66,0.35)',
        'purple':  '0 4px 20px rgba(123,97,255,0.35)',
        'peach':   '0 4px 20px rgba(255,183,165,0.40)',
        'glow-orange': '0 0 0 4px rgba(255,140,66,0.20)',
        'glow-purple': '0 0 0 4px rgba(123,97,255,0.20)',
        'inner-sm': 'inset 0 1px 4px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-warm':    'linear-gradient(135deg, #FFB7A5 0%, #CDB4DB 100%)',
        'gradient-cool':    'linear-gradient(135deg, #A2D2FF 0%, #BDE0C9 100%)',
        'gradient-sunny':   'linear-gradient(135deg, #FF8C42 0%, #FFB7A5 100%)',
        'gradient-royal':   'linear-gradient(135deg, #7B61FF 0%, #CDB4DB 100%)',
        'gradient-hero':    'linear-gradient(160deg, #FFF8E7 0%, #FFE5DC 50%, #EDE0F5 100%)',
      },
      animation: {
        'bounce-slow':  'bounce 2s infinite',
        'pulse-soft':   'pulse-soft 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-in':      'fadeIn 0.35s ease forwards',
        'pop-in':       'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'spin-slow':    'spin 3s linear infinite',
        'wiggle':       'wiggle 0.4s ease-in-out',
        'bar-fill':     'barFill 1s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.6 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        popIn: {
          from:  { opacity: 0, transform: 'scale(0.85)' },
          to:    { opacity: 1, transform: 'scale(1)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-4deg)' },
          '50%':     { transform: 'rotate(4deg)' },
        },
        barFill: {
          from: { width: '0%' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,140,66,0)' },
          '50%':     { boxShadow: '0 0 0 6px rgba(255,140,66,0.25)' },
        },
      },
    },
  },
  plugins: [],
};
