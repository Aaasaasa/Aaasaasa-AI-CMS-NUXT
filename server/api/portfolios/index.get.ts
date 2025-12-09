// server/api/portfolios/index.get.ts
import { getAllPortfolios } from '../../services/portfolio.service'
import { createApiResponse, serverError } from '../../utils/response'

export default defineEventHandler(async () => {
  try {
    const portfolios = await getAllPortfolios()

    return createApiResponse(portfolios, 200, 'Portfolios erfolgreich abgerufen')
  } catch {
    throw serverError('SERVER', 'Fehler beim Abrufen der Portfolios')
  }
})
