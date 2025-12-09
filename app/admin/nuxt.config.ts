// app/admin/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:url'

export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: { shim: true },

  modulesDir: [
    'node_modules', // globalni (root)
    resolve(__dirname, 'node_modules') // lokalni
  ],

  //rootDir: resolve(__dirname, '../../'),
  srcDir: './',
  // serverDir: resolve(__dirname, '../../server'),

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
    // 'nuxt-security'
  ],

  css: ['~/assets/css/tailwind.css'],

  components: [{ path: '~/components', extensions: ['vue'], pathPrefix: false }],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },

  alias: {
    '~': resolve(__dirname, '.'),
    '#': resolve(__dirname, '..'),
    '@': resolve(__dirname, '.'),
    '@shared': resolve(__dirname, '../../packages/shared'),
    '@utils': resolve(__dirname, '../../packages/utils')
  },

  vite: {
    plugins: [tsconfigPaths()],
    define: { 'import.meta.require': undefined }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.PUBLIC_API_BASE || 'http://localhost:4000/api'
    }
  },

  // 👇 Ručno dok secure nuxt ne aktualizira na 3.x verziju osnovne bezbjednosne zaglavlja
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Access-Control-Max-Age': '86400'
      }
    }
  },

  compatibilityDate: '2025-09-13'
})
