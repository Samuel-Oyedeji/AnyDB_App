/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode
        'light-bg': '#FFFFFF',
        'light-secondary': '#F5F5F5',
        'light-text': '#333333',
        'light-primary': '#1976D2',
        'light-primary-hover': '#1565C0',
        'light-border': '#E0E0E0',
        // Dark Mode
        'dark-bg': '#212121',
        'dark-secondary': '#424242',
        'dark-text': '#E0E0E0',
        'dark-primary': '#64B5F6',
        'dark-primary-hover': '#42A5F5',
        'dark-border': '#616161',
      },
    },
  },
  plugins: [],
};