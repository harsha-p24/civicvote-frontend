/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: { DEFAULT: '#0f2942', light: '#e6f1fb', mid: '#1a3a5c' },
        civic: { DEFAULT: '#1D9E75', light: '#E1F5EE', dark: '#085041' },
      }
    }
  },
  plugins: []
}
