// server/services/page.service.ts
import prismaCms from '../utils/prismaCms'

// Types
interface PageWithAuthor {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  status: string
  menuOrder: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    login: string
    email: string
    displayName: string
  }
}

/**
 * Page Service - Pure business logic without validation
 */

/**
 * Get all pages
 */
export async function getAllPages(): Promise<PageWithAuthor[]> {
  try {
    const pages = await prismaCms.page.findMany({
      include: {
        author: true,
        translations: {
          where: { lang: 'de' }, // Default language
          take: 1
        },
        metas: {
          where: { key: 'featured_image' },
          include: {
            Media: {
              include: {
                sizes: true
              }
            }
          }
        }
      },
      orderBy: { menuOrder: 'asc' }
    })

    return pages.map((page) => {
      const translation = page.translations[0] || {}
      const featuredImageMeta = page.metas?.[0]

      // Build featured image URL from Media relation (capital M)
      let featuredImage = null
      if (featuredImageMeta?.Media) {
        featuredImage = featuredImageMeta.Media.filePath
      }

      return {
        id: page.id.toString(),
        title: translation.title || 'Untitled',
        slug: page.slug,
        content: translation.content || '',
        excerpt: translation.excerpt || null,
        featuredImage,
        status: page.status,
        menuOrder: page.menuOrder,
        publishedAt: page.status === 'PUBLISHED' ? page.createdAt : null,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        author: {
          id: page.author.id.toString(),
          username: page.author.displayName, // Show displayName instead of login
          email: page.author.email,
          firstName: page.author.firstName || null,
          lastName: page.author.lastName || null
        }
      }
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database error in getAllPages:', error)
    throw new Error('Failed to fetch pages from database')
  }
}

/**
 * Get page by slug
 */
export async function getPageBySlug(slug: string): Promise<PageWithAuthor | null> {
  try {
    const page = await prismaCms.page.findFirst({
      where: { slug },
      include: {
        author: true,
        translations: {
          where: { lang: 'de' }, // Default language
          take: 1
        },
        metas: {
          where: { key: 'featured_image' },
          include: {
            Media: {
              include: {
                sizes: true
              }
            }
          }
        }
      }
    })

    if (!page) {
      return null
    }

    const translation = page.translations[0] || {}
    const featuredImageMeta = page.metas?.[0]

    // Build featured image URL from Media relation (capital M)
    let featuredImage = null
    if (featuredImageMeta?.Media) {
      featuredImage = featuredImageMeta.Media.filePath
    }

    return {
      id: page.id.toString(),
      title: translation.title || 'Untitled',
      slug: page.slug,
      content: translation.content || '',
      excerpt: translation.excerpt || null,
      featuredImage,
      status: page.status,
      menuOrder: page.menuOrder,
      publishedAt: page.status === 'PUBLISHED' ? page.createdAt : null,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      author: {
        id: page.author.id.toString(),
        username: page.author.displayName, // Show displayName instead of login
        email: page.author.email,
        firstName: page.author.firstName || null,
        lastName: page.author.lastName || null
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database error in getPageBySlug:', error)
    return null
  }
}
