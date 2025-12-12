// server/utils/prismaWp.ts - MariaDB Legacy Migration Client (Lazy Init)
// Legacy database for WordPress content migration (kept for data import scripts)
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'
import { PrismaClient as PrismaWpClient } from '../../prisma/generated/mysql/client'

let prismaWpInstance: PrismaWpClient | null = null
let mariaPool: mariadb.Pool | null = null

function initPrismaWp(): PrismaWpClient {
  if (!prismaWpInstance) {
    const mariaUrl =
      process.env.MYSQL_URL ||
      process.env.MYSQL_DATABASE_URL ||
      'mysql://root:root@localhost:3306/mysql'

    mariaPool = mariadb.createPool(mariaUrl)
    const adapter = new PrismaMariaDb(mariaUrl)

    prismaWpInstance = new PrismaWpClient({ adapter })
  }

  return prismaWpInstance
}

// Proxy für Lazy Loading
const prismaWp = new Proxy({} as PrismaWpClient, {
  get(target, prop) {
    const client = initPrismaWp()
    return client[prop as keyof PrismaWpClient]
  }
})

export default prismaWp
