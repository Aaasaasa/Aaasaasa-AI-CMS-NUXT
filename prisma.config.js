// Central Prisma config to register all schema locations for multi-database setup
import { defineConfig } from '@prisma/config'

// Determine which schema is being acted on so we can route the correct datasource URL
const argv = process.argv
const schemaArg =
  argv.find((arg) => arg.startsWith('--schema=')) ||
  (() => {
    const idx = argv.findIndex((arg) => arg === '--schema' || arg === '-s')
    return idx !== -1 ? argv[idx + 1] : undefined
  })()

const schemaPath = schemaArg?.replace('--schema=', '')

const datasourceUrl = (() => {
  if (schemaPath?.includes('mysql')) {
    return process.env.MYSQL_URL ?? 'mysql://root:root@localhost:3306/mysql'
  }
  if (schemaPath?.includes('mongo')) {
    return process.env.MONGO_URL ?? 'mongodb://localhost:27017/placeholder'
  }
  return process.env.POSTGRES_CMS_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres'
})()

export default defineConfig({
  schemas: [
    './prisma/adapters/schema-postgres.prisma',
    './prisma/adapters/schema-mysql.prisma',
    './prisma/adapters/schema-mongo.prisma'
  ],
  datasource: {
    url: datasourceUrl
  }
})
