// server/utils/prismaMongo.ts - MongoDB Analytics Client (Singleton)
// Analytics, logs, session data
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)
const mongoClientPath = resolve(process.cwd(), 'prisma/generated/mongo/client')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient: PrismaMongoClient } = require(mongoClientPath) as typeof import('../../prisma/generated/mongo/client')

// Global singleton for hot reload in development
declare const globalThis: {
  __prismaMongo?: any
} & typeof global

if (!globalThis.__prismaMongo) {
  const client = new PrismaMongoClient()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prismaMongo = client
  }
}

const prismaMongoClient = globalThis.__prismaMongo!
export default prismaMongoClient
