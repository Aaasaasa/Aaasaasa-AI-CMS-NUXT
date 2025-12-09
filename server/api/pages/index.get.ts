// server/api/pages/index.get.ts
import { getAllPages } from '../../services/page.service'
import { createApiResponse, serverError } from '../../utils/response'

export default defineEventHandler(async () => {
  try {
    const pages = await getAllPages()

    return createApiResponse(pages, 200, 'Pages erfolgreich abgerufen')
  } catch {
    throw serverError('SERVER', 'Fehler beim Abrufen der Pages')
  }
})
