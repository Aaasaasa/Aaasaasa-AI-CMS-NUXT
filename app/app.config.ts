export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'cyan',
      neutral: 'slate'
    },
    // Define semantic color tokens for theme switching
    semanticColors: {
      background: 'white',
      foreground: 'gray-900',
      muted: 'gray-100',
      'muted-foreground': 'gray-500',
      border: 'gray-200',
      input: 'gray-100',
      ring: 'blue-500'
    }
  }
})
