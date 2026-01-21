/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#020617',
        slate: '#1E293B',
        teal: '#2DD4BF',
        gold: '#A16207',
        red: '#E11D48',
        text: '#F8FAFC',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Cinzel"', 'serif'],
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'float-up': 'floatUp 1.5s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translate(-50%, 0)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -80px)' },
        }
      }
    },
  },
  plugins: [],
}
