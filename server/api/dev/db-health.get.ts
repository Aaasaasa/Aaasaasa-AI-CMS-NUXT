// server/api/dev/db-health.get.ts
// Database Health Check für alle Prisma Clients (PostgreSQL, MySQL, MongoDB)
// GET /api/dev/db-health

import { defineEventHandler } from 'h3'
import prismaCms from '../../utils/prismaCms'
import prismaWp from '../../utils/prismaWp'
import prismaMongo from '../../utils/prismaMongo'

export default defineEventHandler(async () => {
  const result: Record<string, any> = {}
  const startTime = Date.now()

  // ========================================
  // PostgreSQL CMS (MANDATORY - Primary DB)
  // ========================================
  try {
    const pgStart = Date.now()

    // Check connection with simple query
    await prismaCms.$queryRaw`SELECT 1`

    // Count main CMS tables
    const [userCount, articleCount, pageCount, portfolioCount, productCount, menuCount] =
      await Promise.all([
        prismaCms.user.count(),
        prismaCms.article.count(),
        prismaCms.page.count(),
        prismaCms.portfolio.count(),
        prismaCms.product.count(),
        prismaCms.menu.count()
      ])

    const pgLatency = Date.now() - pgStart

    result.postgres = {
      status: 'connected',
      latency: pgLatency,
      database: 'nuxt_pg_cms_db',
      url: 'localhost:5432',
      tables: {
        cms_users: userCount,
        cms_articles: articleCount,
        cms_pages: pageCount,
        cms_portfolios: portfolioCount,
        cms_products: productCount,
        cms_menus: menuCount
      }
    }

    await prismaCms.$disconnect()
  } catch (err: any) {
    result.postgres = {
      status: 'error',
      error: err.message,
      database: 'nuxt_pg_cms_db',
      url: 'localhost:5432'
    }
  }

  // ========================================
  // MySQL WordPress (OPTIONAL - Migration)
  // ========================================
  try {
    const mysqlStart = Date.now()

    // Check connection
    await prismaWp.$queryRaw`SELECT 1`

    // Count WordPress posts (optional, nur wenn Schema vorhanden)
    let postCount = 0
    try {
      const result = await prismaWp.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM as_posts WHERE post_status = 'publish'
      `
      postCount = Number(result[0]?.count || 0)
    } catch {
      // Table might not exist, ignore
    }

    const mysqlLatency = Date.now() - mysqlStart

    result.mysql = {
      status: 'connected',
      latency: mysqlLatency,
      database: 'sta3wp',
      url: 'localhost:3306',
      tables: {
        as_posts: postCount
      }
    }
  } catch (err: any) {
    result.mysql = {
      status: 'warning',
      error: err.message,
      database: 'sta3wp',
      url: 'localhost:3306',
      note: 'WordPress DB is optional for migration only'
    }
  }

  // ========================================
  // MongoDB (OPTIONAL - Analytics)
  // ========================================
  // MongoDB ist derzeit nicht implementiert (nur Placeholder)
  result.mongo = {
    status: 'not_implemented',
    note: 'MongoDB client is a placeholder. Prisma 7 MongoDB support is limited to raw queries only.'
  }

  // ========================================
  // Overall Health Status
  // ========================================
  const totalLatency = Date.now() - startTime
  let overallStatus = 'healthy'

  // PostgreSQL must be connected (critical)
  if (result.postgres?.status !== 'connected') {
    overallStatus = 'unhealthy'
  }
  // MySQL or Mongo warnings = degraded
  else if (result.mysql?.status === 'warning' || result.mongo?.status === 'warning') {
    overallStatus = 'degraded'
  }

  // Server info
  const serverInfo = {
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    latency: totalLatency,
    databases: result,
    server: serverInfo
  }
})
