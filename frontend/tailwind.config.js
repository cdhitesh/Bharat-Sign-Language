/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:  {
          50:  "#FDFAF4",
          100: "#F5F0E8",
          200: "#EDEADE",
          300: "#E0D9CC",
          400: "#C8BFA8",
        },
        forest: {
          50:  "#EEF2EB",
          100: "#D4DFCE",
          200: "#A8BF9C",
          300: "#7A9F6A",
          400: "#5A7A4A",
          500: "#4A5C3F",
          600: "#3A4A30",
          700: "#2C3824",
          800: "#1E2618",
          900: "#10140D",
        },
        gold: {
          50:  "#FDF8EC",
          100: "#FAEECE",
          200: "#F4DC9C",
          300: "#ECC85A",
          400: "#C49A2A",
          500: "#A67E1A",
          600: "#86640E",
          700: "#664C08",
          800: "#4A3604",
          900: "#2E2102",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted:   "#6B6B5A",
          faint:   "#9A9A88",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body:    ["Lato", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "organic": "40% 60% 55% 45% / 45% 45% 55% 55%",
        "blob":    "60% 40% 30% 70% / 60% 30% 70% 40%",
        "4xl":     "2rem",
        "5xl":     "2.5rem",
      },
      boxShadow: {
        "warm-sm":  "0 2px 8px rgba(74,92,63,0.08)",
        "warm-md":  "0 4px 20px rgba(74,92,63,0.12)",
        "warm-lg":  "0 8px 40px rgba(74,92,63,0.16)",
        "gold":     "0 4px 16px rgba(196,154,42,0.25)",
        "card":     "0 2px 12px rgba(26,26,26,0.06), 0 1px 3px rgba(26,26,26,0.04)",
        "card-hover": "0 8px 32px rgba(26,26,26,0.1), 0 2px 8px rgba(26,26,26,0.06)",
      },
      animation: {
        "fade-up":     "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":     "fadeIn 0.5s ease-out both",
        "scale-in":    "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-right": "slideRight 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "float":       "float 5s ease-in-out infinite",
        "shimmer":     "shimmer 2s linear infinite",
        "bounce-soft": "bounceSoft 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "spin-slow":   "spin 8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSoft: {
          "0%":   { opacity: "0", transform: "scale(0.85)" },
          "60%":  { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};