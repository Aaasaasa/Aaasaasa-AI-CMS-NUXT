// server/api/cookies/consent.post.ts
import { cookieService } from '../../services/cookie.service'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { consentId, userId, categories, policyVersion } = body

    // Validierung
    if (!consentId || !categories || !policyVersion) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fehlende erforderliche Felder'
      })
    }

    // IP und User-Agent aus Headers extrahieren
    const ipAddress = getClientIP(event)
    const userAgent = getHeader(event, 'user-agent')

    const consent = await cookieService.saveConsent({
      consentId,
      userId,
      categories,
      policyVersion,
      ipAddress,
      userAgent
    })

    return {
      success: true,
      data: consent
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Fehler beim Speichern der Einwilligung'
    })
  }
})
