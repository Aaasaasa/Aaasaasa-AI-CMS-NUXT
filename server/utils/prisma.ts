// server/utils/prisma.ts
// Server-side Prisma Utilities für Multi-Database Setup (Prisma 7 clients)

import type { PrismaClient as PrismaCmsClient } from '../../prisma/generated/postgres-cms/client'
import type { PrismaClient as PrismaWpClient } from '../../prisma/generated/mysql/client'

import prismaCms from './prismaCms'
import prismaWp from './prismaWp'
import prismaMongo from './prismaMongo'

export function getPrismaClients(): {
  postgres: PrismaCmsClient
  mysql: PrismaWpClient
  mongo: null
} {
  return {
    postgres: prismaCms,
    mysql: prismaWp,
    mongo: prismaMongo
  }
}

export function getPostgresClient(): PrismaCmsClient {
  return prismaCms
}

export function getMySQLClient(): PrismaWpClient {
  return prismaWp
}

export function getMongoClient(): null {
  return prismaMongo
}
