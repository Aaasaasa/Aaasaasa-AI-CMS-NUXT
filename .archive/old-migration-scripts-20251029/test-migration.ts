// scripts/test-migration.ts
// Test-Script für WordPress Migration

import { PrismaClient } from '../prisma/generated/mysql/index.js'
import dotenv from 'dotenv'

dotenv.config()

const mysqlClient = new PrismaClient({
  datasources: {
    mysql: {
      url: process.env.MYSQL_URL
    }
  }
})

async function testWordPressConnection() {
  process.stdout.write('🔍 Teste WordPress/MySQL Verbindung...\n\n')

  try {
    // Prüfe verfügbare Tabellen
    const tables = (await mysqlClient.$queryRaw`
      SHOW TABLES LIKE 'as_%'
    `) as any[]

    process.stdout.write(`📊 Gefundene WordPress Tabellen: ${tables.length}\n`)

    // Prüfe Benutzer
    const users = (await mysqlClient.$queryRaw`
      SELECT COUNT(*) as count FROM as_users
    `) as any[]
    process.stdout.write(`👥 WordPress Benutzer: ${users[0].count}\n`)

    // Prüfe Posts
    const posts = (await mysqlClient.$queryRaw`
      SELECT COUNT(*) as count FROM as_posts WHERE post_type IN ('post', 'page')
    `) as any[]
    process.stdout.write(`📝 WordPress Posts/Pages: ${posts[0].count}\n`)

    // Prüfe Kategorien
    const terms = (await mysqlClient.$queryRaw`
      SELECT COUNT(*) as count FROM as_terms
    `) as any[]
    process.stdout.write(`🏷️  WordPress Begriffe: ${terms[0].count}\n`)

    // Zeige Sample Posts
    const samplePosts = (await mysqlClient.$queryRaw`
      SELECT post_title, post_type, post_status, post_date
      FROM as_posts
      WHERE post_type IN ('post', 'page')
        AND post_status = 'publish'
      ORDER BY post_date DESC
      LIMIT 5
    `) as any[]

    process.stdout.write('\n📄 Sample Posts:\n')
    for (const post of samplePosts) {
      process.stdout.write(`- ${post.post_title} (${post.post_type}) - ${post.post_date}\n`)
    }

    process.stdout.write('\n✅ WordPress Verbindung erfolgreich!\n')
    process.stdout.write('🚀 Bereit für Migration mit: yarn wp:migrate\n')

    await mysqlClient.$disconnect()
  } catch (error) {
    process.stderr.write(`❌ Fehler bei WordPress Test: ${error}\n`)
    process.exit(1)
  }
}

// ES Module Kompatibilität
if (import.meta.url === `file://${process.argv[1]}`) {
  testWordPressConnection()
}

export default testWordPressConnection
