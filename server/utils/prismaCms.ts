// server/utils/prismaCms.ts - PostgreSQL CMS Client (Singleton)
// Primary database for all CMS content (posts, pages, users, etc.)

import { PrismaClient as PrismaCmsClient } from '@@/prisma/generated/postgres-cms/index.js'

// Global singleton for hot reload in development
declare const globalThis: {
  __prismaCms?: PrismaCmsClient
} & typeof global

const prismaCmsClient =
  globalThis.__prismaCms ||
  new PrismaCmsClient({
    datasources: {
      pgCMSdb: {
        url: process.env.POSTGRES_CMS_URL || process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaCms = prismaCmsClient
}

export default prismaCmsClient
