// server/api/posts/[id].get.ts
// GET /api/posts/:id - Post Details (supports both ID and slug)

import { getPostById, getPostBySlug } from '../../services/post.service'
import { createApiResponse, notFoundError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const idOrSlug = getRouterParam(event, 'id')

    if (!idOrSlug) {
      throw notFoundError('RESOURCE', 'Post ID or slug ist erforderlich')
    }

    // Try to get by slug first (for WordPress articles), then by ID
    let post = await getPostBySlug(idOrSlug)

    if (!post && !isNaN(Number(idOrSlug))) {
      // If slug lookup failed and it's a number, try ID lookup
      post = await getPostById(idOrSlug)
    }

    if (!post) {
      throw notFoundError('RESOURCE', 'Post nicht gefunden')
    }

    return createApiResponse(post, 200, 'Post erfolgreich abgerufen')
  } catch {
    throw notFoundError('RESOURCE', 'Post nicht gefunden')
  }
})
