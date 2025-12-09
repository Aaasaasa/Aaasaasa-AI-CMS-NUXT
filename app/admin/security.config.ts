// app/admin/security.config.ts
import { defineSecurityConfig } from 'nuxt-security/config'

const isDev = process.env.NODE_ENV !== 'production'

export default defineSecurityConfig({
  headers: {
    contentSecurityPolicy: isDev
      ? false
      : {
          'default-src': ['\'self\''],
          'img-src': ['\'self\'', 'data:', 'https:'],
          'style-src': ['\'self\'', '\'unsafe-inline\''],
          'script-src': ['\'self\''],
          'font-src': ['\'self\'', 'data:'],
          'connect-src': ['\'self\'', 'https:'],
          'object-src': ['\'none\''],
          'frame-ancestors': ['\'none\''],
          'base-uri': ['\'self\''],
          'form-action': ['\'self\'']
        },
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'no-referrer',
    strictTransportSecurity: { maxAge: 31536000, includeSubdomains: true, preload: true }
  },

  corsHandler: {
    origin: isDev
      ? ['http://localhost:3300', 'http://localhost:3000', 'http://localhost:4000']
      : [process.env.ADMIN_URL].filter(Boolean),
    credentials: true
  },

  rateLimiter: { tokensPerInterval: 100, interval: 300000, throwError: true },
  requestSizeLimiter: { maxRequestSizeInBytes: 2000000, maxUploadFileRequestInBytes: 8000000 },
  hidePoweredBy: true
})
