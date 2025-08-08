/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#7C3AED',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    },
  },
  plugins: [],
}

