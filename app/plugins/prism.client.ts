// Global Prism type declaration
declare global {
  interface Window {
    Prism?: typeof import('prismjs')
  }
}

// Prism.js Setup für Syntax Highlighting
export default defineNuxtPlugin(() => {
  // Nur im Client ausführen
  if (import.meta.client) {
    // Dynamisch Prism.js laden
    const loadPrism = async () => {
      try {
        // Core Prism
        const Prism = await import('prismjs')

        // Komponenten für verschiedene Sprachen
        await import('prismjs/components/prism-bash')
        await import('prismjs/components/prism-javascript')
        await import('prismjs/components/prism-typescript')
        await import('prismjs/components/prism-json')
        await import('prismjs/components/prism-css')
        await import('prismjs/components/prism-scss')
        await import('prismjs/components/prism-php')
        await import('prismjs/components/prism-python')
        await import('prismjs/components/prism-sql')
        await import('prismjs/components/prism-yaml')
        await import('prismjs/components/prism-markdown')
        await import('prismjs/components/prism-docker')

        // Prism CSS Theme
        await import('prismjs/themes/prism-tomorrow.css')

        // Plugins
        await import('prismjs/plugins/line-numbers/prism-line-numbers.css')
        await import('prismjs/plugins/line-numbers/prism-line-numbers')

        // Global verfügbar machen
        window.Prism = Prism.default || Prism

        return window.Prism
      } catch {
        return null
      }
    }

    // Prism beim Plugin-Start laden
    loadPrism()
  }
})
