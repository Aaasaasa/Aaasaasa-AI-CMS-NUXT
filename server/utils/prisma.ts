// server/utils/prisma.ts
// Server-side Prisma Utilities für Multi-Database Setup

import prismaCms from './prismaCms'
import prismaWp from './prismaWp'
import prismaMongo from './prismaMongo'

export async function getPrismaClients() {
  return {
    postgres: prismaCms,
    mysql: prismaWp,
    mongo: prismaMongo
  }
}

export async function getPostgresClient() {
  return prismaCms
}

export async function getMySQLClient() {
  return prismaWp
}

export async function getMongoClient() {
  return prismaMongo
}
