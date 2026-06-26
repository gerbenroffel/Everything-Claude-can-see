/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04091a',
          900: '#070d1a',
          800: '#0d1526',
          700: '#111e35',
          600: '#172644',
        },
      },
    },
  },
  plugins: [],
}
