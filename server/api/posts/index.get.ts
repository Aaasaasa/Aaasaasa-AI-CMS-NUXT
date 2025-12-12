// server/api/posts/index.get.ts
// GET /api/posts - Liste aller Posts mit Author-Information

import { getAllPosts } from '../../services/post.service'
import { createApiResponse } from '../../utils/response'
import { serverError } from '../../utils/errors'

export default defineEventHandler(async () => {
  try {
    // Posts vom Service holen (Service hat keine Parameter)
    const posts = await getAllPosts()

    return createApiResponse(posts, 200, 'Posts erfolgreich abgerufen')
  } catch {
    // Server error mit korrektem ErrorCode
    throw serverError('SERVER', 'Fehler beim Abrufen der Posts')
  }
})
