// server/api/pages/index.get.ts
import { getAllPages } from '../../services/page.service'
import { createApiResponse } from '../../utils/response'
import { serverError } from '../../utils/errors'

export default defineEventHandler(async () => {
  try {
    const pages = await getAllPages()

    return createApiResponse(pages, 200, 'Pages erfolgreich abgerufen')
  } catch {
    throw serverError('SERVER', 'Fehler beim Abrufen der Pages')
  }
})
