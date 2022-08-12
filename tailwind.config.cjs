/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem", // Equivalent to p-5
    },
    extend: {},
    fontFamily: {
      sans: ["Work Sans", ...defaultTheme.fontFamily.sans],
      serif: ["DM Serif Display", ...defaultTheme.fontFamily.serif],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
