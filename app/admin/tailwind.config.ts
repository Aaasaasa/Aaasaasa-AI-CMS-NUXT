// app/admin/tailwind.config.ts
import baseConfig from '../../tailwind.config.cjs'

export default {
  ...baseConfig,
  content: ['./app/admin/**/*.{vue,js,ts,html}', './shared/**/*.{vue,js,ts,html}'],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        brand: '#e11d48' // Admin-specific
      }
    }
  }
}
