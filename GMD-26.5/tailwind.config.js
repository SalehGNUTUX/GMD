/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gmd: {
          900: '#1a0505',
          800: '#2d0a0a',
          700: '#450f0f',
          600: '#5c1414',
          500: '#7a1c1c',
          400: '#a82828',
          300: '#d64040',
          200: '#e86666',
          100: '#f5b5b5',
          50: '#fce8e8',
        },
        dark: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1e1e1e',
          700: '#2a2a2a',
          600: '#363636',
          500: '#525252',
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#f5f5f5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Tahoma', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 40, 40, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(168, 40, 40, 0.8), 0 0 40px rgba(168, 40, 40, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}