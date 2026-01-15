/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#14b8a6',
          dark: '#0d9488',
          light: '#5eead4',
          neon: '#00ffe7',
          neon2: '#00c3ff',
        },
        dark: {
          DEFAULT: '#181a20',
          darker: '#101117',
          lighter: '#23263a',
          glass: 'rgba(24,26,32,0.7)',
          glassLight: 'rgba(35,38,58,0.4)',
        },
        borderGlass: 'rgba(255,255,255,0.08)',
        borderNeon: '#00ffe7',
        gradient1: 'linear-gradient(135deg, #23263a 0%, #0f172a 100%)',
        gradient2: 'linear-gradient(135deg, #00ffe7 0%, #14b8a6 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        neon: '0 0 16px #00ffe7',
        accent: '0 2px 8px 0 #14b8a6',
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px #00ffe7, 0 0 20px #00ffe7' },
          'to': { boxShadow: '0 0 20px #00ffe7, 0 0 30px #00ffe7' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


