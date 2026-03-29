/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        border: 'var(--bg-border)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        primary: 'var(--text-primary)',
        muted: 'var(--text-muted)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
