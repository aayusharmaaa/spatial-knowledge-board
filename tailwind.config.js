/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme
        background: {
          DEFAULT: '#ffffff',
          dark: '#0a0e27',
        },
        text: {
          DEFAULT: '#1e293b',
          dark: '#f1f5f9',
        },
        // Minimal colors - grays and subtle accents
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
      },
      animation: {
        'zoom-transition': 'zoom-transition 500ms ease-out',
      },
      keyframes: {
        'zoom-transition': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
