/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // MOJA - Turquoise/Cyan tones
        sea: {
          50: "#E8F8FA",
          100: "#D1F1F5",
          200: "#A3E4EC",
          300: "#6DD4E1",
          400: "#3FC5D5",
          500: "#2CB5C9", // Primary cyan from "MOJA"
          600: "#2399AA",
          700: "#1A7A88",
          800: "#125A66",
          900: "#0A3B44",
        },
        // SEZONA - Orange/Gold gradient
        sun: {
          50: "#FFF9EB",
          100: "#FFF0CC",
          200: "#FFE099",
          300: "#FFCC00", // Bright yellow/gold
          400: "#FFB526",
          500: "#F7941D", // Primary orange from "SEZONA"
          600: "#D97B0D",
          700: "#B36109",
          800: "#8C4A07",
          900: "#663505",
        },
        // Ocean wave blues
        ocean: {
          50: "#E6F6FB",
          100: "#CCECF7",
          200: "#99D9EF",
          300: "#5DD3E8",
          400: "#33C2DC",
          500: "#0099CC", // Deep ocean blue
          600: "#007AA3",
          700: "#005C7A",
          800: "#003D51",
          900: "#001F28",
        },
        // Palm tree green
        palm: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#4CAF50", // Palm green
          600: "#43A047",
          700: "#388E3C",
          800: "#2E7D32",
          900: "#1B5E20",
        },
      },
    },
  },
  plugins: [],
};
