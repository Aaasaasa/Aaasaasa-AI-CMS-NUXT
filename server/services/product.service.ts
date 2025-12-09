// server/services/product.service.ts
import prismaCms from '../utils/prismaCms'

// Types
interface ProductWithVendor {
  id: string
  title: string
  slug: string
  description: string
  excerpt: string | null
  featuredImage: string | null
  price: number | null
  currency: string
  stock: number
  createdAt: Date
  updatedAt: Date
  vendor: {
    id: string
    login: string
    email: string
    displayName: string
  }
}

/**
 * Product Service
 */

/**
 * Get all products
 */
export async function getAllProducts(): Promise<ProductWithVendor[]> {
  try {
    const products = await prismaCms.product.findMany({
      include: {
        vendor: true,
        translations: {
          where: { lang: 'de' }, // Default language
          take: 1
        },
        metas: {
          where: { key: 'featured_image' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return products.map((product) => {
      const translation = product.translations[0] || {}

      return {
        id: product.id.toString(),
        title: translation.title || 'Untitled Product',
        slug: product.slug,
        description: translation.description || '',
        excerpt: null, // Products don't have excerpts in this schema
        featuredImage: product.metas?.[0]?.value
          ? typeof product.metas[0].value === 'string'
            ? product.metas[0].value
            : typeof product.metas[0].value === 'object'
              ? JSON.stringify(product.metas[0].value)
              : String(product.metas[0].value)
          : null,
        price: product.price,
        currency: product.currency,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        vendor: {
          id: product.vendor.id.toString(),
          username: product.vendor.login,
          email: product.vendor.email,
          displayName: product.vendor.displayName
        }
      }
    })
  } catch {
    throw new Error('Failed to fetch products from database')
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithVendor | null> {
  try {
    const product = await prismaCms.product.findFirst({
      where: { slug },
      include: {
        vendor: true,
        translations: {
          where: { lang: 'de' }, // Default language
          take: 1
        },
        metas: {
          where: { key: 'featured_image' }
        }
      }
    })

    if (!product) {
      return null
    }

    const translation = product.translations[0] || {}

    return {
      id: product.id.toString(),
      title: translation.title || 'Untitled Product',
      slug: product.slug,
      description: translation.description || '',
      excerpt: null, // Products don't have excerpts in this schema
      featuredImage: product.metas?.[0]?.value
        ? typeof product.metas[0].value === 'string'
          ? product.metas[0].value
          : typeof product.metas[0].value === 'object'
            ? JSON.stringify(product.metas[0].value)
            : String(product.metas[0].value)
        : null,
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      vendor: {
        id: product.vendor.id.toString(),
        username: product.vendor.login,
        email: product.vendor.email,
        displayName: product.vendor.displayName
      }
    }
  } catch {
    return null
  }
}
