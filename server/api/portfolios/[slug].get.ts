// server/api/portfolios/[slug].get.ts
import { getPortfolioBySlug } from '../../services/portfolio.service'
import { createApiResponse, serverError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Portfolio slug is required'
      })
    }

    const portfolio = await getPortfolioBySlug(slug)

    if (!portfolio) {
      throw createError({
        statusCode: 404,
        statusMessage: `Portfolio not found with slug: ${slug}`
      })
    }

    return createApiResponse(portfolio, 200, 'Portfolio erfolgreich abgerufen')
  } catch (error: any) {
    // If it's already an HTTP error, re-throw it
    if (error.statusCode) {
      throw error
    }

    // Otherwise, it's a server error
    throw serverError('INTERNAL_ERROR', 'Fehler beim Abrufen des Portfolios')
  }
})
