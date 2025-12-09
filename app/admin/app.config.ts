// app/admin/app.config.ts
import { defineAppConfig } from 'nuxt/app'

export default defineAppConfig({
  i18n: {
    locales: [
      {
        code: 'de',
        name: 'Deutsch',
        files: ['de/common.json', 'de/seo.json'],
        language: 'de-DE',
        flag: 'i-openmoji:flag-germany'
      },
      {
        code: 'en',
        name: 'English',
        files: ['en/common.json', 'en/seo.json'],
        language: 'en-US',
        flag: 'i-openmoji:flag-united-states'
      },
      {
        code: 'sr',
        name: 'Србски',
        files: ['sr/common.json', 'sr/seo.json'],
        language: 'sr-SR',
        flag: 'i-openmoji:flag-serbia'
      },
      {
        code: 'ru',
        name: 'Russia',
        files: ['ru/common.json', 'ru/seo.json'],
        language: 'ru-RU',
        flag: 'i-openmoji:flag-russia'
      },
      {
        code: 'es',
        name: 'Español',
        files: ['es/common.json', 'es/seo.json'],
        language: 'es-ES',
        flag: 'i-openmoji:flag-spain'
      },
      {
        code: 'it',
        name: 'Italy',
        files: ['it/common.json', 'it/seo.json'],
        language: 'it-IT',
        flag: 'i-openmoji:flag-italy'
      }
    ],
    defaultLocale: 'de',
    strategy: 'prefix_except_default'
  },
  ui: {
    icons: ['lucide', 'openmoji'],
    primary: 'indigo',
    gray: 'neutral',
    darkMode: true,
    radius: 'md',
    strategy: 'merge',
    container: {
      constrained: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    },

    button: {
      base: 'inline-flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2',
      variants: {
        solid: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-700 hover:bg-gray-100'
      },
      sizes: {
        sm: 'px-2.5 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
      }
    },

    card: {
      base: 'rounded-lg shadow-sm border border-gray-200 bg-white dark:bg-gray-900',
      header: 'px-4 py-2 border-b border-gray-200 dark:border-gray-800 font-semibold',
      body: 'p-4',
      footer: 'px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500'
    },

    input: {
      base: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
      sizes: {
        sm: 'text-sm',
        md: 'text-base'
      }
    },

    modal: {
      overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4',
      content: 'bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-lg w-full overflow-hidden'
    }
  },

  theme: {
    colorMode: {
      preference: 'system',
      fallback: 'light'
    }
  },

  layout: {
    sidebarWidth: '16rem',
    containerMaxWidth: '1440px'
  },

  appMeta: {
    title: 'Admin Dashboard',
    description: 'Bazify admin control panel built with Nuxt 4, TailwindCSS and @nuxt/ui'
  }
})
