/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },
        dark: {
          base: "#0D0B08",
          card: "#1A1510",
          elevated: "#262015",
          surface: "#332B1E",
        },
        light: {
          base: "#FFFBF5",
          card: "#FFFFFF",
          surface: "#FEF8F0",
        },
      },
      fontFamily: {
        sans: ["Tajawal"],
        arabic: ["Tajawal"],
      },
    },
  },
  plugins: [],
};
