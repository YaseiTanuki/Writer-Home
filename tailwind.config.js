/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/component/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Semantic aliases mapped to CSS vars */
        background:     'var(--background)',
        foreground:     'var(--foreground)',
        'card-bg':      'var(--card-bg)',
        'card-bg-alt':  'var(--card-bg-alt)',
        'border-color': 'var(--border-color)',
        'hover-bg':     'var(--hover-bg)',
        accent:         'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        /* Catppuccin Mocha direct tokens (for className usage) */
        ctp: {
          crust:    '#11111b',
          mantle:   '#181825',
          base:     '#1e1e2e',
          surface0: '#313244',
          surface1: '#45475a',
          surface2: '#585b70',
          overlay0: '#6c7086',
          overlay1: '#7f849c',
          overlay2: '#9399b2',
          subtext0: '#a6adc8',
          subtext1: '#bac2de',
          text:     '#cdd6f4',
          lavender: '#b4befe',
          blue:     '#89b4fa',
          sapphire: '#74c7ec',
          sky:      '#89dceb',
          teal:     '#94e2d5',
          green:    '#a6e3a1',
          yellow:   '#f9e2af',
          peach:    '#fab387',
          maroon:   '#eba0ac',
          red:      '#f38ba8',
          mauve:    '#cba6f7',
          pink:     '#f5c2e7',
        },
      },
    },
  },
  plugins: [],
}
