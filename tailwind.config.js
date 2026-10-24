/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/static/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
