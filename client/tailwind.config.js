/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ink: {
          50: "#f0f0f7",
          100: "#e2e2ef",
          200: "#c5c5df",
          300: "#a8a8cf",
          400: "#7b7bbf",
          500: "#5a5aaf",
          600: "#47478c",
          700: "#343469",
          800: "#212146",
          900: "#0e0e23",
          950: "#07070f",
        },
        sage: {
          400: "#86efac",
          500: "#4ade80",
        },
        amber: {
          400: "#fbbf24",
        },
        rose: {
          400: "#fb7185",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: 0, transform: "scale(0.95)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
