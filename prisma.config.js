// prisma.config.js - Prisma 7 Configuration
import 'dotenv/config'
import { defineConfig } from '@prisma/config'

// Extract --schema or -s from CLI arguments to determine which schema file is being used
const argv = process.argv
const schemaArg =
  argv.find((arg) => arg.startsWith('--schema=')) ||
  (() => {
    const idx = argv.findIndex((arg) => arg === '--schema' || arg === '-s')
    return idx !== -1 ? argv[idx + 1] : undefined
  })()

const schemaPath = schemaArg?.replace('--schema=', '')

// Determine the correct database URL based on the schema being used
const getDatasourceUrl = () => {
  if (schemaPath?.includes('mysql')) {
    const url = process.env.MYSQL_URL
    if (!url) throw new Error('MYSQL_URL environment variable is not set for MySQL schema')
    return url
  }

  if (schemaPath?.includes('mongo')) {
    const url = process.env.MONGO_URL
    if (!url) throw new Error('MONGO_URL environment variable is not set for MongoDB schema')
    return url
  }

  // Default: PostgreSQL CMS
  const url = process.env.POSTGRES_CMS_URL
  if (!url) throw new Error('POSTGRES_CMS_URL environment variable is not set for PostgreSQL CMS schema')
  return url
}

export default defineConfig({
  // Register all schema files
  schemas: [
    './prisma/adapters/schema-postgres.prisma',
    './prisma/adapters/schema-mysql.prisma',
    './prisma/adapters/schema-mongo.prisma',
  ],
  // Prisma 7: datasource is now configured here instead of in schema files
  datasource: {
    url: getDatasourceUrl(),
  },
})
