// server/api/posts/index.post.ts
// POST /api/posts - Neuen Post erstellen

import { createPost } from '../../services/post.service'
import { createApiResponse } from '../../utils/response'
import { badRequestError, unauthorizedError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Authentifizierung prüfen
    const user = event.context.user
    if (!user?.id) {
      throw unauthorizedError('VALIDATION', 'Anmeldung erforderlich')
    }

    // Request Body lesen
    const body = await readBody(event)

    if (!body.title || !body.content) {
      throw badRequestError('VALIDATION', 'Titel und Inhalt sind erforderlich')
    }

    // Slug aus Titel generieren falls nicht vorhanden
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    const postData = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt,
      featuredImage: body.featuredImage,
      authorId: user.id,
      status: body.status || 'DRAFT'
    }

    const post = await createPost(postData, user.id)

    return createApiResponse(post, 201, 'Post erfolgreich erstellt')
  } catch (error) {
    // Wenn bereits ein strukturierter Fehler, weitergeben
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw badRequestError('VALIDATION', 'Fehler beim Erstellen des Posts')
  }
})
