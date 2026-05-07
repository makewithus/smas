/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: '#1B4332',
          50:  '#E8F5EE',
          100: '#C6E6D4',
          200: '#8DCBAA',
          300: '#57AD82',
          400: '#2D8A5E',
          500: '#1B4332',
          600: '#163828',
          700: '#112C1F',
          800: '#0B2015',
          900: '#06130C',
          foreground: '#FFFFFF',
        },
        // Accent / Amber
        accent: {
          DEFAULT: '#D39542',
          50:  '#FDF3E3',
          100: '#FAE3BC',
          200: '#F5C97A',
          300: '#EFB048',
          400: '#D39542',
          500: '#B07A2E',
          600: '#8C601E',
          700: '#6A4814',
          800: '#4B310C',
          900: '#2D1D06',
          foreground: '#FFFFFF',
        },
        // Neutrals
        neutral: {
          50:  '#FAF6F1',
          100: '#F5EFE8',
          200: '#EDE4D8',
          300: '#E8DFD4',
          400: '#D4C9BA',
          500: '#B8A99A',
          600: '#8C7B6B',
          700: '#6B5A4E',
          800: '#4A3B32',
          900: '#3D3227',
        },
        // Semantic
        background: '#FAF6F1',
        surface:    '#F5EFE8',
        border:     '#E8DFD4',
        // Status
        status: {
          active:   '#1B4332',
          inactive: '#8C7B6B',
          pending:  '#D39542',
        },
      },
      fontFamily: {
        sans:    ['Public Sans', 'sans-serif'],
        serif:   ['Newsreader', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['12px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'md':   ['15px', { lineHeight: '24px' }],
        'lg':   ['16px', { lineHeight: '26px' }],
        'xl':   ['20px', { lineHeight: '30px' }],
        '2xl':  ['24px', { lineHeight: '34px' }],
        '3xl':  ['30px', { lineHeight: '40px' }],
        '4xl':  ['40px', { lineHeight: '52px' }],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(61,50,39,0.06), 0 1px 2px rgba(61,50,39,0.04)',
        'dropdown': '0 4px 12px rgba(61,50,39,0.10)',
        'modal': '0 8px 24px rgba(61,50,39,0.12)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
