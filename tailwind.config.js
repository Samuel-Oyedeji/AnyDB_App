/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light Mode (Unchanged)
        'light-bg': '#FFFFFF',
        'light-secondary': '#F9FAFB',
        'light-text': '#1F2937',
        'light-primary': '#4B5563',
        'light-primary-hover': '#374151',
        'light-border': '#E5E7EB',
        'light-path': '#0F172A',
        // Dark Mode (Adjusted)
        'dark-bg': '#171717',
        'dark-secondary': '#2D3748', // Lightened from #1F2937
        'dark-text': '#D1D5DB',
        'dark-primary': '#A3BFFA', // Shifted to indigo
        'dark-primary-hover': '#7F9CF5', // Indigo hover
        'dark-border': '#4B5563', // Lightened from #374151
        'dark-path': '#D1D5DB',
      },
    },
  },
  plugins: [],
};