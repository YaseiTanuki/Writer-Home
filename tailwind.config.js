/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
        'hover-bg': 'var(--hover-bg)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
      },
    },
  },
  plugins: [],
}
