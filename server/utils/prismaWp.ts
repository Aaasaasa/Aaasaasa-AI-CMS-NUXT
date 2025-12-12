// server/utils/prismaWp.ts - MariaDB Legacy Migration Client (Singleton)
// Legacy database for WordPress content migration (kept for data import scripts)
import { PrismaClient as PrismaWpClient } from '../../prisma/generated/mysql/client'

// ...

const globalForPrisma = globalThis as typeof globalThis & {
  __prismaWp?: any
}

if (!globalForPrisma.__prismaWp) {
  // Prisma 7: Direct connection via datasourceUrl (no adapter needed)
  const datasourceUrl =
    process.env.MYSQL_URL ||
    process.env.MYSQL_DATABASE_URL ||
    'mysql://root:root@localhost:3306/mysql'

  globalForPrisma.__prismaWp = new PrismaWpClient({
    datasourceUrl,
  })
}

const prismaWp = globalForPrisma.__prismaWp!
export default prismaWp
