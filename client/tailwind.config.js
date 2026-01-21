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
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
}
