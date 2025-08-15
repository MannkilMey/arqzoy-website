/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f3',
          100: '#f7e6d3',
          200: '#ecc5a0',
          300: '#d69e6d',
          400: '#c17d47',
          500: '#a65d2a',
          600: '#8b4a1f',
          700: '#723a18',
          800: '#5c2f13',
          900: '#4a2510',
        },
        accent: {
          50: '#f9f7f4',
          100: '#f0ebe3',
          200: '#e3d4c3',
          300: '#d1b899',
          400: '#bc956f',
          500: '#a67c52',
          600: '#8f6642',
          700: '#75523a',
          800: '#614235',
          900: '#523930',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}