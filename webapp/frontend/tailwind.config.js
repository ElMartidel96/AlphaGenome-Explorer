/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // AlphaGenome brand colors
        'ag-primary': '#1a73e8',
        'ag-secondary': '#34a853',
        'ag-accent': '#ea4335',
        'ag-dark': '#1f2937',
      },
    },
  },
  plugins: [],
}
