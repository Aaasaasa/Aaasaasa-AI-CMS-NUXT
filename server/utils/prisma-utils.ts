// server/lib/prisma-utils.ts - Multi-Database Prisma Clients for NuxtWP Theme
// PostgreSQL (CMS), MySQL (Legacy WP Migration), MongoDB (Analytics)
// Server-side utilities for database connections

// Singleton instances for each database
let postgresClient: any
let mysqlClient: any
let mongoClient: any

// Global type definitions for hot reload
declare const globalThis: {
  __prismaPostgres?: any
  __prismaMysql?: any
  __prismaMongo?: any
} & typeof global

// PostgreSQL CMS Client (Primary Database)
export const getPostgresClient = async () => {
  if (!postgresClient) {
    if (process.env.NODE_ENV !== 'production' && globalThis.__prismaPostgres) {
      postgresClient = globalThis.__prismaPostgres
    } else {
      try {
        const { PrismaClient } = await import('@@/prisma/generated/postgres-cms')
        postgresClient = new PrismaClient({
          datasources: {
            pgCMSdb: {
              url: process.env.POSTGRES_CMS_URL || process.env.DATABASE_URL
            }
          }
        })

        if (process.env.NODE_ENV !== 'production') {
          globalThis.__prismaPostgres = postgresClient
        }
      } catch {
        // PostgreSQL client not available
        return null
      }
    }
  }
  return postgresClient
}

// MySQL Legacy Migration Client
export const getMySQLClient = async () => {
  if (!mysqlClient) {
    if (process.env.NODE_ENV !== 'production' && globalThis.__prismaMysql) {
      mysqlClient = globalThis.__prismaMysql
    } else {
      try {
        const { PrismaClient } = await import('@@/prisma/generated/mysql')
        mysqlClient = new PrismaClient({
          datasources: {
            mysql: {
              url: process.env.MYSQL_URL || process.env.MYSQL_DATABASE_URL
            }
          }
        })

        if (process.env.NODE_ENV !== 'production') {
          globalThis.__prismaMysql = mysqlClient
        }
      } catch {
        // MySQL client not available
        return null
      }
    }
  }
  return mysqlClient
}

// MongoDB Analytics Client
export const getMongoClient = async () => {
  if (!mongoClient) {
    if (process.env.NODE_ENV !== 'production' && globalThis.__prismaMongo) {
      mongoClient = globalThis.__prismaMongo
    } else {
      try {
        const { PrismaClient } = await import('@@/prisma/generated/mongo')
        mongoClient = new PrismaClient({
          datasources: {
            mongo: {
              url: process.env.MONGO_URL || process.env.MONGODB_DATABASE_URL
            }
          }
        })

        if (process.env.NODE_ENV !== 'production') {
          globalThis.__prismaMongo = mongoClient
        }
      } catch {
        // MongoDB client not available
        return null
      }
    }
  }
  return mongoClient
}

// Utility function to get all clients
export const getAllClients = async () => ({
  postgres: await getPostgresClient(),
  mysql: await getMySQLClient(),
  mongo: await getMongoClient()
})

// Cleanup function for graceful shutdown
export const disconnectAllClients = async () => {
  const promises: Promise<void>[] = []

  if (postgresClient?.$disconnect) {
    promises.push(postgresClient.$disconnect())
  }

  if (mysqlClient?.$disconnect) {
    promises.push(mysqlClient.$disconnect())
  }

  if (mongoClient?.$disconnect) {
    promises.push(mongoClient.$disconnect())
  }

  await Promise.allSettled(promises)
}

// Default export - lazy loaded PostgreSQL client
export default {
  get postgres() {
    return getPostgresClient()
  },
  get mysql() {
    return getMySQLClient()
  },
  get mongo() {
    return getMongoClient()
  }
}
