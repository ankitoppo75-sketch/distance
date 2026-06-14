/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F2042",
          50: "#EEF1F8",
          100: "#D7DEF0",
          400: "#3C5A96",
          500: "#1C3768",
          600: "#142A52",
          700: "#0F2042",
          800: "#0A1730",
          900: "#060F1E",
        },
        pathway: {
          DEFAULT: "#2A4DD0",
          50: "#EBF0FE",
          100: "#D2DCFC",
          400: "#5A78E0",
          500: "#2A4DD0",
          600: "#1F3BAE",
          700: "#172C82",
        },
        teal: {
          DEFAULT: "#13B8A6",
          50: "#E6FBF8",
          100: "#BFF3EC",
          400: "#34CDBC",
          500: "#13B8A6",
          600: "#0E9485",
        },
        amber: {
          DEFAULT: "#F5A623",
          50: "#FFF6E6",
          100: "#FFE7BD",
          400: "#F7B848",
          500: "#F5A623",
          600: "#D6890C",
        },
        paper: "#F7F8FC",
        slate: {
          50: "#F6F7FA",
          400: "#7C8AA3",
          500: "#5B6B82",
          600: "#475569",
          700: "#334155",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(15, 32, 66, 0.25)",
        card: "0 4px 24px -8px rgba(15, 32, 66, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(1.4)" },
        },
        dashMove: {
          to: { strokeDashoffset: -40 },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        pulseDot: "pulseDot 2s ease-in-out infinite",
        dashMove: "dashMove 1.5s linear infinite",
        fadeUp: "fadeUp 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};
