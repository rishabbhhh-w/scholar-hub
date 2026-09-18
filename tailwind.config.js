/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#047857",
          800: "#065f46",
          850: "#074635",
          900: "#064e3b",
          950: "#053225", // Exact match for Reference Image 2 deep forest panel
        },
        saffron: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        sage: {
          50: "#f4f8f4",
          100: "#eaf5ea",
          200: "#d2ebd2",
          300: "#a9d8aa",
          500: "#4e8c52",
        },
        canvas: {
          light: "#fcfbf9",
          card: "#ffffff",
          dark: "#07130e",
          darkCard: "#0f231c",
          darkBorder: "#193c30",
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(10, 40, 25, 0.05), 0 2px 6px -1px rgba(10, 40, 25, 0.03)',
        'elevated': '0 12px 36px -4px rgba(10, 40, 25, 0.08), 0 4px 12px -2px rgba(10, 40, 25, 0.04)',
        'floating': '0 20px 50px -10px rgba(5, 50, 37, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
