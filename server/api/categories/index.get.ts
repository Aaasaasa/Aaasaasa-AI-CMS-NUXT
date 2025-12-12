// server/api/categories/index.get.ts - Get all categories with Redis caching
import { PrismaClient } from '../../../prisma/generated/postgres-cms/client'
import { createClient } from 'redis'

const pg = new PrismaClient()

// Redis Client (wiederverwendbar)
let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    redisClient = createClient({ url: redisUrl })
    await redisClient.connect()
  }
  return redisClient
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = (query.lang as string) || 'de'
  const includeCount = query.count !== 'false' // Default: true

  const cacheKey = `categories:${lang}:${includeCount}`

  try {
    // 1️⃣ Redis Cache Check
    const redis = await getRedisClient()
    const cached = await redis.get(cacheKey)

    if (cached) {
      return {
        data: JSON.parse(cached),
        cached: true,
        timestamp: new Date().toISOString()
      }
    }

    // 2️⃣ Datenbank Query
    const categories = await pg.$queryRaw<
      Array<{
        id: number
        name: string
        slug: string
        description: string | null
        article_count: bigint
      }>
    >`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.description,
        COUNT(tr.id) as article_count
      FROM cms_terms t
      JOIN cms_term_taxonomies tt ON t.id = tt."termId"
      LEFT JOIN cms_term_relationships tr ON tt.id = tr."termTaxonomyId"
        AND tr."articleId" IS NOT NULL
      WHERE tt.taxonomy = 'category'
      GROUP BY t.id, t.name, t.slug, t.description
      ORDER BY article_count DESC, t.name ASC
    `

    // Konvertiere bigint zu number
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      articleCount: Number(cat.article_count)
    }))

    // 3️⃣ Cache in Redis (60 Minuten)
    await redis.setEx(cacheKey, 3600, JSON.stringify(formattedCategories))

    return {
      data: formattedCategories,
      cached: false,
      timestamp: new Date().toISOString()
    }
  } catch {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch categories'
    })
  }
})
