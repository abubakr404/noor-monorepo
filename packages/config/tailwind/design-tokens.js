/** @type {import('./types').DesignTokens} */
module.exports = {
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
  borderRadius: {
    sm: "6px",
    DEFAULT: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  fontFamily: {
    sans: ["Tajawal", "sans-serif"],
    arabic: ["Tajawal", "sans-serif"],
  },
  fontSize: {
    "arabic-sm": ["1rem", { lineHeight: "1.8" }],
    "arabic-base": ["1.25rem", { lineHeight: "2" }],
    "arabic-lg": ["1.5rem", { lineHeight: "2.2" }],
    "arabic-xl": ["1.75rem", { lineHeight: "2.4" }],
    "arabic-2xl": ["2rem", { lineHeight: "2.6" }],
  },
};
