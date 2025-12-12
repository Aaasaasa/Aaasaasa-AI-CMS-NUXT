// server/api/products/[slug].get.ts
import { getProductBySlug } from '../../services/product.service'
import { createApiResponse } from '../../utils/response'
import { serverError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product slug is required'
      })
    }

    const product = await getProductBySlug(slug)

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: `Product not found with slug: ${slug}`
      })
    }

    return createApiResponse(product, 200, 'Product erfolgreich abgerufen')
  } catch (error: any) {
    // If it's already an HTTP error, re-throw it
    if (error.statusCode) {
      throw error
    }

    // Otherwise, it's a server error
    throw serverError('INTERNAL_ERROR', 'Fehler beim Abrufen des Products')
  }
})
