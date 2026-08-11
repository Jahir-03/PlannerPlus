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
          400: '#e5c158',
          500: '#d4af37',
          600: '#b89220',
        },
        burgundy: {
          900: '#900c3f',
        },
      },
    },
  },
  plugins: [],
}
