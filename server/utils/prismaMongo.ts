// server/utils/prismaMongo.ts - MongoDB Analytics Client (Singleton)
// Analytics, logs, session data

import { PrismaClient as PrismaMongoClient } from '@@/prisma/generated/mongo'

// Global singleton for hot reload in development
declare const globalThis: {
  __prismaMongo?: PrismaMongoClient
} & typeof global

const prismaMongoClient =
  globalThis.__prismaMongo ||
  new PrismaMongoClient({
    datasources: {
      mongo: {
        url: process.env.MONGO_URL || process.env.MONGODB_DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaMongo = prismaMongoClient
}

export default prismaMongoClient
