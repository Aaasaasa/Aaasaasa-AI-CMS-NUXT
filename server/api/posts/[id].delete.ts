// server/api/posts/[id].delete.ts
// DELETE /api/posts/:id - Post löschen

import { deletePost } from '../../services/post.service'
import { createApiResponse } from '../../utils/response'
import { notFoundError, unauthorizedError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Authentifizierung prüfen
    const user = event.context.user
    if (!user?.id) {
      throw unauthorizedError('VALIDATION', 'Anmeldung erforderlich')
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw notFoundError('RESOURCE', 'Post ID ist erforderlich')
    }

    // Post löschen (Service prüft Berechtigung)
    await deletePost(id, user.id)

    return createApiResponse(null, 204, 'Post erfolgreich gelöscht')
  } catch (error) {
    // Wenn bereits ein strukturierter Fehler, weitergeben
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw notFoundError('RESOURCE', 'Post nicht gefunden')
  }
})
