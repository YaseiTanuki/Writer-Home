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
        'card-bg-alt': 'var(--card-bg-alt)',
        'border-color': 'var(--border-color)',
        'hover-bg': 'var(--hover-bg)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'neon-pink': 'var(--neon-pink)',
        'neon-lavender': 'var(--neon-lavender)',
        'neon-mint': 'var(--neon-mint)',
        'neon-teal': 'var(--neon-teal)',
        'neon-yellow': 'var(--neon-yellow)',
      },
      boxShadow: {
        'neon-pink': '0 0 8px var(--neon-pink)',
        'neon-lavender': '0 0 8px var(--neon-lavender)',
        'neon-mint': '0 0 8px var(--neon-mint)',
        'neon-teal': '0 0 8px var(--neon-teal)',
        'neon-yellow': '0 0 8px var(--neon-yellow)',
      },
    },
  },
  plugins: [],
}
