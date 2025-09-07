/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        colmeak: ['colmeak', 'sans-serif'],
        oups: ['oups', 'sans-serif'],
        dirtylane: ['dirtylane', 'oups'],
      },
    },
  },
  plugins: [],
}

