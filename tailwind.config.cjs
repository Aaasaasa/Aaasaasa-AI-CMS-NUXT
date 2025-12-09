// tailwind.config.js (root monorepo)
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // koristi .dark klasu za switch
  content: [
    './app/**/*.{vue,js,ts,html}',
    './app/web/**/*.{vue,js,ts,html}',
    './app/admin/**/*.{vue,js,ts,html}',
    './shared/**/*.{vue,js,ts,html}'
  ],
  theme: {
    extend: {
      // globalna proširenja (ako hoćeš da se dele između svih app)
      borderRadius: {
        '2xl': '1rem'
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)'
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)'
        }
      }
    }
  },
  plugins: [
    // require('@tailwindcss/typography'),
    // require('tailwindcss-animate')
  ]
}
