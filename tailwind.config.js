/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5B21B6", // Piercing Deep Violet
        "violet-accent": "#5B21B6",
        "neutral-dark": "#0A0A0A",
        "neutral-mid": "#404040",
        "neutral-light": "#F5F5F5",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
