/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Purple Brand Colors
        brand: {
          50: '#faf7ff',
          100: '#f3ecff',
          200: '#e9d8ff',
          300: '#d8b9ff',
          400: '#c491ff',
          500: '#ab5aff',
          600: '#9333ea', // Primary brand color
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Complementary Purple Shades
        primary: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e2deff',
          300: '#cdc2ff',
          400: '#b199ff',
          500: '#9061ff',
          600: '#7c3aed', // Main primary
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Professional Grays
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(147, 51, 234, 0.15)',
        'brand-lg': '0 10px 25px -3px rgba(147, 51, 234, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}