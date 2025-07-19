/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          light: "#4CAF50", // Green color for farming theme
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
        },
        secondary: {
          light: "#8BC34A", // Light green
          DEFAULT: "#689F38",
          dark: "#33691E",
        },
        accent: {
          light: "#FFC107", // Amber for crop/wheat color
          DEFAULT: "#FFA000",
          dark: "#FF8F00",
        },
        // Dark theme colors will be handled through the 'dark:' variant
      },
      fontFamily: {
        sans: ["SpaceMono", "sans-serif"],
      },
    },
  },
  plugins: [],
};
