// Media resolver utility for handling featured images from media table
// This provides size variants, fallbacks, and consistent media handling

interface MediaRecord {
  id: number
  filename: string
  file_path: string
  mime_type: string
  width?: number
  height?: number
  alt_text?: string
}

interface MediaSize {
  size_name: string
  file_path: string
  width?: number
  height?: number
}

interface FeaturedImageData {
  media_id?: number
  featured_image?: string // Fallback path
  updated_at?: string
}

interface ResolvedMedia {
  id: number
  url: string
  alt: string
  width?: number
  height?: number
  sizes: {
    thumbnail?: string
    medium?: string
    large?: string
    original: string
  }
}

export class MediaResolver {
  private client: any

  constructor(client: any) {
    this.client = client
  }

  /**
   * Resolve featured image for content item
   */
  async resolveFeaturedImage(
    featuredImageData: string | FeaturedImageData | null
  ): Promise<ResolvedMedia | null> {
    if (!featuredImageData) return null

    let mediaId: number | null = null
    let fallbackPath: string | null = null

    // Handle different data formats
    if (typeof featuredImageData === 'string') {
      // Legacy format - direct path
      fallbackPath = featuredImageData.replace(/^"(.*)"$/, '$1') // Remove quotes
    } else if (typeof featuredImageData === 'object') {
      mediaId = featuredImageData.media_id || null
      fallbackPath = featuredImageData.featured_image?.replace(/^"(.*)"$/, '$1') || null
    }

    // Try to resolve from media table first
    if (mediaId) {
      const resolved = await this.resolveByMediaId(mediaId)
      if (resolved) return resolved
    }

    // Fallback to path-based lookup
    if (fallbackPath) {
      const resolved = await this.resolveByPath(fallbackPath)
      if (resolved) return resolved

      // If still not found, return fallback structure
      return this.createFallbackMedia(fallbackPath)
    }

    return null
  }

  /**
   * Resolve media by media_id from cms_media table
   */
  async resolveByMediaId(mediaId: number): Promise<ResolvedMedia | null> {
    try {
      const result = (await this.client.$queryRaw`
        SELECT
          m.id,
          m.filename,
          m.file_path,
          m.mime_type,
          m.width,
          m.height,
          m.alt_text,
          COALESCE(
            json_agg(
              json_build_object(
                'size_name', ms.size_name,
                'file_path', ms.file_path,
                'width', ms.width,
                'height', ms.height
              )
            ) FILTER (WHERE ms.id IS NOT NULL),
            '[]'::json
          ) as sizes
        FROM cms_media m
        LEFT JOIN cms_media_sizes ms ON ms.media_id = m.id
        WHERE m.id = ${mediaId}
        GROUP BY m.id, m.filename, m.file_path, m.mime_type, m.width, m.height, m.alt_text
      `) as MediaRecord[]

      if (!result || result.length === 0) return null

      const media = result[0] as MediaRecord & { sizes: MediaSize[] }

      return this.formatMediaResponse(media, media.sizes || [])
    } catch {
      return null
    }
  }

  /**
   * Resolve media by file path from cms_media table
   */
  async resolveByPath(filePath: string): Promise<ResolvedMedia | null> {
    try {
      const result = (await this.client.$queryRaw`
        SELECT
          m.id,
          m.filename,
          m.file_path,
          m.mime_type,
          m.width,
          m.height,
          m.alt_text,
          COALESCE(
            json_agg(
              json_build_object(
                'size_name', ms.size_name,
                'file_path', ms.file_path,
                'width', ms.width,
                'height', ms.height
              )
            ) FILTER (WHERE ms.id IS NOT NULL),
            '[]'::json
          ) as sizes
        FROM cms_media m
        LEFT JOIN cms_media_sizes ms ON ms.media_id = m.id
        WHERE m.file_path = ${filePath}
        GROUP BY m.id, m.filename, m.file_path, m.mime_type, m.width, m.height, m.alt_text
        LIMIT 1
      `) as MediaRecord[]

      if (!result || result.length === 0) return null

      const media = result[0] as MediaRecord & { sizes: MediaSize[] }

      return this.formatMediaResponse(media, media.sizes || [])
    } catch {
      return null
    }
  }

  /**
   * Format media response with size variants
   */
  private formatMediaResponse(media: MediaRecord, sizes: MediaSize[]): ResolvedMedia {
    const sizesMap: ResolvedMedia['sizes'] = {
      original: media.file_path
    }

    // Build sizes map from available variants
    sizes.forEach((size) => {
      if (size.size_name === 'thumbnail') {
        sizesMap.thumbnail = size.file_path
      } else if (size.size_name === 'medium') {
        sizesMap.medium = size.file_path
      } else if (size.size_name === 'large') {
        sizesMap.large = size.file_path
      }
    })

    return {
      id: media.id,
      url: media.file_path,
      alt: media.alt_text || media.filename || 'Featured image',
      width: media.width,
      height: media.height,
      sizes: sizesMap
    }
  }

  /**
   * Create fallback media structure for legacy paths
   */
  private createFallbackMedia(filePath: string): ResolvedMedia {
    const filename = filePath.split('/').pop() || 'image'

    return {
      id: 0, // Indicates fallback
      url: filePath,
      alt: filename.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
      sizes: {
        original: filePath
      }
    }
  }

  /**
   * Batch resolve multiple featured images
   */
  async resolveBatch(
    items: Array<{ id: number; featuredImage: any }>
  ): Promise<Array<{ id: number; media: ResolvedMedia | null }>> {
    const results = []

    for (const item of items) {
      const media = await this.resolveFeaturedImage(item.featuredImage)
      results.push({ id: item.id, media })
    }

    return results
  }
}

// Usage example for server API routes:
/*
import { pgCMSClient } from '~/lib/prisma'
import { MediaResolver } from '~/server/utils/mediaResolver'

export default defineEventHandler(async (event) => {
  const mediaResolver = new MediaResolver(pgCMSClient)

  // Get articles with featured images
  const articles = await pgCMSClient.query(`
    SELECT a.id, a.slug, at.title, am.value as featured_image
    FROM cms_articles a
    LEFT JOIN cms_article_translations at ON at."articleId" = a.id AND at.lang = 'de'
    LEFT JOIN cms_article_meta am ON am."articleId" = a.id AND am.key = 'featured_image'
    WHERE a.status = 'PUBLISHED'
  `)

  // Resolve featured images
  const articlesWithMedia = await Promise.all(
    articles.rows.map(async (article) => {
      const featuredMedia = await mediaResolver.resolveFeaturedImage(article.featured_image)

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        featuredImage: featuredMedia?.url,
        featuredImageAlt: featuredMedia?.alt,
        featuredImageSizes: featuredMedia?.sizes
      }
    })
  )

  return {
    data: articlesWithMedia
  }
})
*/
