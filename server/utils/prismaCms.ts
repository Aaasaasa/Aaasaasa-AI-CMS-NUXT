// server/utils/prismaCms.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient as PrismaCmsClient } from '../../prisma/generated/postgres-cms/client'

let prismaCmsInstance: PrismaCmsClient | null = null
let pgPool: Pool | null = null

function initPrismaCms(): PrismaCmsClient {
  if (!prismaCmsInstance) {
    const url = process.env.POSTGRES_CMS_URL || process.env.POSTGRES_URL
    if (!url) {
      throw new Error('POSTGRES_CMS_URL ili POSTGRES_URL није постављен за CMS базу')
    }

    pgPool = new Pool({ connectionString: url })
    const adapter = new PrismaPg(pgPool)

    prismaCmsInstance = new PrismaCmsClient({ adapter })
  }

  return prismaCmsInstance
}

// Proxy für Lazy Loading
const prismaCms = new Proxy({} as PrismaCmsClient, {
  get(target, prop) {
    const client = initPrismaCms()
    return client[prop as keyof PrismaCmsClient]
  }
})

export default prismaCms
