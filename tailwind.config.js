/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',     // белый фон
        foreground: '#111111',     // тёмный текст
      }
    },
  },
  plugins: [],
}
