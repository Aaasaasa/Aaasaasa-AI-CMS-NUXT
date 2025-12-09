// server/api/cookies/consent/[id].get.ts
import { cookieService } from '../../../services/cookie.service'

export default defineEventHandler(async (event) => {
  try {
    const consentId = getRouterParam(event, 'id')

    if (!consentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Consent ID ist erforderlich'
      })
    }

    const consent = await cookieService.getConsent(consentId)

    if (!consent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Einwilligung nicht gefunden'
      })
    }

    return {
      success: true,
      data: consent
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Fehler beim Laden der Einwilligung'
    })
  }
})
