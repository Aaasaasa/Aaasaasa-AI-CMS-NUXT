// server/api/cookies/policy.get.ts
import { cookieService } from '../../services/cookie.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = (query.lang as string) || 'de'

  try {
    const policy = await cookieService.getActiveCookiePolicy(lang)

    if (!policy) {
      // Return default/empty policy instead of throwing error
      return {
        success: true,
        data: {
          id: 0,
          version: '1.0',
          lang,
          content: '',
          categories: [],
          isActive: true,
          effectiveDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }

    return {
      success: true,
      data: policy
    }
  } catch {
    // Return empty policy instead of throwing 500
    return {
      success: true,
      data: {
        id: 0,
        version: '1.0',
        lang,
        content: '',
        categories: [],
        isActive: true,
        effectiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }
})
