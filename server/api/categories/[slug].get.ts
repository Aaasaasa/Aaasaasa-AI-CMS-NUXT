// server/api/categories/[slug].get.ts
// API Endpoint für Artikel nach Kategorie mit Redis Caching

import prismaCms from '../../utils/prismaCms'
import { createClient } from 'redis'

const pg = prismaCms

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
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const lang = (query.lang as string) || 'de'
  const page = parseInt((query.page as string) || '1')
  const limit = parseInt((query.limit as string) || '10')
  const offset = (page - 1) * limit

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Category slug is required'
    })
  }

  const cacheKey = `category:${slug}:${lang}:page${page}:limit${limit}`

  try {
    // 1️⃣ Redis Cache Check
    const redis = await getRedisClient()
    const cached = await redis.get(cacheKey)

    if (cached) {
      return {
        ...JSON.parse(cached),
        cached: true
      }
    }

    // 2️⃣ Finde Kategorie
    const category = await pg.term.findFirst({
      where: { slug },
      include: {
        taxonomies: {
          where: { taxonomy: 'category' }
        }
      }
    })

    if (!category || !category.taxonomies.length) {
      throw createError({
        statusCode: 404,
        message: `Category "${slug}" not found`
      })
    }

    const taxonomyId = category.taxonomies[0].id

    // 3️⃣ Artikel Query mit Pagination
    const [articles, total] = await Promise.all([
      pg.article.findMany({
        where: {
          terms: {
            some: {
              termTaxonomyId: taxonomyId
            }
          },
          status: 'PUBLISHED'
        },
        include: {
          translations: {
            where: { lang }
          },
          metas: {
            where: {
              key: 'featured_image'
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      pg.article.count({
        where: {
          terms: {
            some: {
              termTaxonomyId: taxonomyId
            }
          },
          status: 'PUBLISHED'
        }
      })
    ])

    // 4️⃣ Formatiere Ergebnisse
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.translations[0]?.title || article.slug,
      excerpt: article.translations[0]?.excerpt || '',
      publishedAt: article.publishedAt,
      featuredImage: article.metas[0]?.value || null
    }))

    const result = {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      cached: false,
      timestamp: new Date().toISOString()
    }

    // 5️⃣ Cache in Redis (30 Minuten)
    await redis.setEx(cacheKey, 1800, JSON.stringify(result))

    return result
  } catch {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch category "${slug}"`
    })
  }
})
