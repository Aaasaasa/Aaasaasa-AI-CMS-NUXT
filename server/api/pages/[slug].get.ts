// server/api/pages/[slug].get.ts
import { getPageBySlug } from '../../services/page.service'
import { createApiResponse, serverError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Page slug is required'
      })
    }

    const page = await getPageBySlug(slug)

    if (!page) {
      throw createError({
        statusCode: 404,
        statusMessage: `Page not found with slug: ${slug}`
      })
    }

    return createApiResponse(page, 200, 'Page erfolgreich abgerufen')
  } catch (error: any) {
    // If it's already an HTTP error, re-throw it
    if (error.statusCode) {
      throw error
    }

    // Otherwise, it's a server error
    throw serverError('INTERNAL_ERROR', 'Fehler beim Abrufen der Page')
  }
})
