// server/api/cookies/categories.get.ts
import { cookieService } from '../../services/cookie.service'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const lang = (query.lang as string) || 'de'

    const categories = await cookieService.getCookieCategories(lang)

    return {
      success: true,
      data: categories
    }
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Cookie-Kategorien'
    })
  }
})
