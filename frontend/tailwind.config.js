/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          primary: '#d4af37',
          light: '#f2d388',
          dark: '#9a7d46',
        }
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212, 175, 55, 0.1)',
        'gold-lg': '0 0 20px rgba(212, 175, 55, 0.2)',
        'gold-2xl': '0 0 40px rgba(212, 175, 55, 0.3)',
      }
    },
  },
  plugins: [],
}
