/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",   // deep green (national, trust)
        secondary: "#22c55e", // light green
      },
    },
  },
  plugins: [],
};
