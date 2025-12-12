// server/utils/prismaCms.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)
const cmsClientPath = resolve(process.cwd(), 'prisma/generated/postgres-cms/client')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient: PrismaCmsClient } = require(cmsClientPath) as typeof import('../../prisma/generated/postgres-cms/client')

const globalForPrisma = globalThis as typeof globalThis & {
  __prismaCms?: any
  __pgPoolCms?: Pool
}

if (!globalForPrisma.__prismaCms) {
  const url = process.env.POSTGRES_CMS_URL || process.env.POSTGRES_URL
  if (!url) {
    throw new Error('POSTGRES_CMS_URL ili POSTGRES_URL није постављен за CMS базу')
  }

  const pool = globalForPrisma.__pgPoolCms ?? new Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)

  globalForPrisma.__prismaCms = new PrismaCmsClient({ adapter })
  globalForPrisma.__pgPoolCms = pool
}

const prismaCms = globalForPrisma.__prismaCms!
export default prismaCms
