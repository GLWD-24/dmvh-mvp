/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        useit: {
          blue: '#1e3a8a',
          red: '#A32D2D',
          legacy: '#0000A0'
        }
      }
    }
  },
  plugins: []
};
