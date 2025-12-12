/* eslint-disable quotes */
// nuxt.config.ts
import { fileURLToPath } from 'node:url'
import packageJson from './package.json'

export default defineNuxtConfig({
  // ========================================
  // Core Configuration
  // ========================================
  compatibilityDate: '2025-07-16',

  devtools: {
    enabled: true,
    timeline: { enabled: true }
  },

  // ========================================
  // Modules
  // ========================================
  modules: [
    // UI & Styling
    '@nuxt/ui',
    '@nuxt/image',

    // Development & Quality
    '@nuxt/eslint',
    '@nuxt/test-utils/module',

    // Internationalization & SEO
    '@nuxtjs/i18n',
    '@nuxtjs/seo',

    // Database & Backend
    // '@prisma/nuxt', // Deaktiviert - verwende custom Multi-Database Setup
    'nuxt-auth-utils',
    'nuxt-nodemailer',

    // Security & State Management
    'nuxt-security',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',

    // Dev Tools
    'nuxt-mcp'
  ],

  // ========================================
  // App & Meta Configuration
  // ========================================
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s | Stajic Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  // ========================================
  // i18n Configuration
  // ========================================
  i18n: {
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        name: 'English',
        files: ['en/common.json', 'en/seo.json', 'en/email.json'],
        language: 'en-US'
      },
      {
        code: 'de',
        name: 'Deutsch',
        files: ['de/common.json', 'de/seo.json', 'de/email.json'],
        language: 'de-DE'
      },
      {
        code: 'sr',
        name: 'Српски',
        files: ['sr/common.json', 'sr/seo.json', 'sr/email.json'],
        language: 'sr-RS'
      },
      {
        code: 'es',
        name: 'Español',
        files: ['es/common.json', 'es/seo.json', 'es/email.json'],
        language: 'es-ES'
      },
      {
        code: 'fr',
        name: 'Français',
        files: ['fr/common.json', 'fr/seo.json', 'fr/email.json'],
        language: 'fr-FR'
      },
      {
        code: 'it',
        name: 'Italiano',
        files: ['it/common.json', 'it/seo.json', 'it/email.json'],
        language: 'it-IT'
      },
      {
        code: 'ru',
        name: 'Русский',
        files: ['ru/common.json', 'ru/seo.json', 'ru/email.json'],
        language: 'ru-RU'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    experimental: {
      localeDetector: 'localeDetector.ts'
    }
  },

  // ========================================
  // Styling
  // ========================================
  css: ['/assets/css/main.css'],

  // ========================================
  // Image Optimization (Modern WebP/AVIF)
  // ========================================
  image: {
    // Deaktiviere IPX für CMS Bilder (sie sind bereits optimiert)
    provider: 'none',

    // Public directory für statische Dateien
    dir: 'public',

    // Responsive Breakpoints
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },

    // IPX Konfiguration für bessere Performance
    ipx: {
      // Cache-Einstellungen für bessere Performance
      maxAge: 60 * 60 * 24 * 365 // 1 Jahr Cache
    }, // Presets für verschiedene Use Cases
    presets: {
      // Blog Post Featured Image
      featured: {
        modifiers: {
          format: 'webp',
          quality: 85,
          width: 1200,
          height: 630,
          fit: 'cover'
        }
      },

      // Thumbnail für Listen
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 80,
          width: 400,
          height: 300,
          fit: 'cover'
        }
      },

      // Avatar/Profile Bilder
      avatar: {
        modifiers: {
          format: 'webp',
          quality: 90,
          width: 128,
          height: 128,
          fit: 'cover'
        }
      }
    }
  },

  // ========================================
  // Auto-imports (Frontend only - no server code)
  // ========================================
  imports: {
    dirs: ['composables/**'],
    scan: true
  },

  // ========================================
  // Nuxt 4 Server Structure Blacklisting
  // ========================================
  ignore: [
    'server/lib/**', // Nuxt 4 server/lib/ mit Prisma Clients
    'prisma/generated/**' // Generierte Prisma Clients
  ],

  // Zod auto-import (modern syntax)
  hooks: {
    'imports:extend': (imports) => {
      imports.push({
        from: 'zod',
        name: 'z'
      })
    }
  },

  // ========================================
  // Nitro Configuration (Server only)
  // ========================================
  nitro: {
    imports: {
      dirs: [
        'server/constants/**',
        'server/services/**',
        'server/types/**'
        // server/utils/** mit Prisma Clients manuell importieren
        // server/lib/** NICHT verwenden
      ],
      // Explizit Prisma-Clients ausschließen
      exclude: [
        'server/utils/prismaCms.ts',
        'server/utils/prismaWp.ts',
        'server/utils/prismaMongo.ts'
      ]
    },
    serverAssets: [{ baseName: 'templates', dir: './templates' }],
    rollupConfig: {
      watch: {
        exclude: [
          'data/**',
          '.docker/**',
          '**/node_modules/**'
        ]
      }
    }
  },
  // Aliase für shared code und Prisma
  alias: {
    '#shared': fileURLToPath(new URL('./shared', import.meta.url))
  },
  // Prisma 7: Clients werden nur server-seitig über Utils geladen
  // Keine Prisma Aliase notwendig - würde zu Import-Fehlern im Frontend führen
  // ========================================
  // Vite Configuration (Frontend only - no Prisma clients)
  // ========================================
  vite: {
    build: { chunkSizeWarningLimit: 600 },
    server: {
      watch: {
        ignored: [
          '**/data/**',
          '**/.docker/**',
          '**/node_modules/**',
          '**/.nuxt/**'
        ]
      },
      fs: {
        strict: false
      }
    }
  },

  // ========================================
  // Security
  // ========================================
  security: {
    headers: {
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'object-src': ["'none'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'script-src-attr': ["'unsafe-inline'"], // Allow inline event handlers
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'upgrade-insecure-requests': false
      },
      crossOriginEmbedderPolicy: 'unsafe-none',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: false,
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'DENY',
      xXSSProtection: '1; mode=block',
      crossOriginOpenerPolicy: false,
      originAgentCluster: false
    },
    corsHandler: false,
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 5 * 60 * 1000,
      throwError: true
    },
    hidePoweredBy: true
  },

  // ========================================
  // Routing
  // ========================================
  routeRules: {
    '/api/**': {
      cors: true,
      headers: { 'Access-Control-Max-Age': '86400' }
    },
    '/lab/**': { prerender: false },
    '/admin/**': { prerender: false }
  },

  // ========================================
  // SEO
  // ========================================
  seo: {
    meta: { twitterCard: 'summary_large_image' }
  },

  // ========================================
  // Runtime Config
  // ========================================
  runtimeConfig: {
    nodemailer: {
      host: '',
      port: 587,
      auth: { user: '', pass: '' },
      from: ''
    },
    rateLimit: {
      loginMax: 5,
      loginWindow: 15,
      tokenCooldown: 5
    },
    public: {
      version: packageJson.version
    }
  }
})
