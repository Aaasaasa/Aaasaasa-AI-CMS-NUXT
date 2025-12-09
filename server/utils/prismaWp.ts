// server/utils/prismaWp.ts - MySQL Legacy Migration Client (Singleton)
// Legacy database for WordPress content migration (kept for data import scripts)

import { PrismaClient as PrismaWpClient } from '@@/prisma/generated/mysql'

// Global singleton for hot reload in development
declare const globalThis: {
  __prismaWp?: PrismaWpClient
} & typeof global

const prismaWpClient =
  globalThis.__prismaWp ||
  new PrismaWpClient({
    datasources: {
      mysql: {
        url: process.env.MYSQL_URL || process.env.MYSQL_DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaWp = prismaWpClient
}

export default prismaWpClient
