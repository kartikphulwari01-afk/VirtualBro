/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050505',
          panel: '#0a0a0a',
          neon: '#00FF9C',
          cyan: '#00E5FF',
          purple: '#B026FF',
          blue: '#1E90FF',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slower': 'spin 12s linear infinite',
        'spin-reverse': 'spin 10s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(0,255,156,0.2))' },
          '100%': { filter: 'drop-shadow(0 0 15px rgba(0,255,156,0.8))' },
        }
      }
    },
  },
  plugins: [],
}
