import type { PrismaClient as PrismaCmsClient } from '@@/prisma/generated/postgres-cms'
import prismaCms from '../utils/prismaCms'

export class CookieService {
  private prisma: PrismaCmsClient

  constructor() {
    this.prisma = prismaCms
  }

  // Get active cookie policy with translations
  async getActiveCookiePolicy(lang = 'de') {
    const policy = await this.prisma.cookiePolicy.findFirst({
      where: { isActive: true },
      include: {
        translations: {
          where: { lang }
        }
      }
    })

    if (!policy || policy.translations.length === 0) {
      return null
    }

    const translation = policy.translations[0]
    return {
      id: policy.id,
      version: policy.version,
      validFrom: policy.validFrom,
      title: translation.title,
      content: translation.content,
      bannerText: translation.bannerText,
      acceptText: translation.acceptText,
      rejectText: translation.rejectText,
      settingsText: translation.settingsText
    }
  }

  // Get all cookie categories with cookies
  async getCookieCategories(lang = 'de') {
    const categories = await this.prisma.cookieCategory.findMany({
      where: { enabled: true },
      include: {
        translations: {
          where: { lang }
        },
        cookies: {
          where: { enabled: true },
          include: {
            translations: {
              where: { lang }
            }
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return categories.map((category) => {
      const translation = category.translations[0]
      return {
        id: category.id,
        key: category.key,
        name: translation?.name || category.name,
        description: translation?.description || category.description,
        required: category.required,
        enabled: category.enabled,
        sortOrder: category.sortOrder,
        cookies: category.cookies.map((cookie) => {
          const cookieTranslation = cookie.translations[0]
          return {
            id: cookie.id,
            name: cookie.name,
            domain: cookie.domain,
            duration: cookie.duration,
            purpose: cookieTranslation?.purpose || cookie.purpose,
            provider: cookieTranslation?.provider || cookie.provider,
            enabled: cookie.enabled
          }
        })
      }
    })
  }

  // Save user consent
  async saveConsent(data: {
    consentId: string
    userId?: number
    categories: Record<string, boolean>
    policyVersion: string
    ipAddress?: string
    userAgent?: string
  }) {
    const existing = await this.prisma.cookieConsent.findUnique({
      where: { id: data.consentId }
    })

    if (existing) {
      return await this.prisma.cookieConsent.update({
        where: { id: data.consentId },
        data: {
          categories: data.categories,
          policyVersion: data.policyVersion,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          updatedAt: new Date()
        }
      })
    }

    return await this.prisma.cookieConsent.create({
      data: {
        id: data.consentId,
        userId: data.userId,
        categories: data.categories,
        policyVersion: data.policyVersion,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    })
  }

  // Get user consent
  async getConsent(consentId: string) {
    return await this.prisma.cookieConsent.findUnique({
      where: { id: consentId }
    })
  }

  // Admin: Create/Update Cookie Category
  async createCookieCategory(data: {
    key: string
    name: string
    description?: string
    required?: boolean
    enabled?: boolean
    sortOrder?: number
    translations: Array<{
      lang: string
      name: string
      description?: string
    }>
  }) {
    return await this.prisma.cookieCategory.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        required: data.required || false,
        enabled: data.enabled ?? true,
        sortOrder: data.sortOrder || 0,
        translations: {
          create: data.translations
        }
      },
      include: {
        translations: true
      }
    })
  }

  // Admin: Create Cookie
  async createCookie(data: {
    categoryId: number
    name: string
    domain?: string
    duration?: string
    purpose: string
    provider?: string
    enabled?: boolean
    translations: Array<{
      lang: string
      purpose: string
      provider?: string
    }>
  }) {
    return await this.prisma.cookie.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        domain: data.domain,
        duration: data.duration,
        purpose: data.purpose,
        provider: data.provider,
        enabled: data.enabled ?? true,
        translations: {
          create: data.translations
        }
      },
      include: {
        translations: true
      }
    })
  }

  // Admin: Create Cookie Policy
  async createCookiePolicy(data: {
    version: string
    isActive?: boolean
    validFrom?: Date
    translations: Array<{
      lang: string
      title: string
      content: string
      bannerText: string
      acceptText?: string
      rejectText?: string
      settingsText?: string
    }>
  }) {
    // Deactivate other policies if this one should be active
    if (data.isActive) {
      await this.prisma.cookiePolicy.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    return await this.prisma.cookiePolicy.create({
      data: {
        version: data.version,
        isActive: data.isActive ?? false,
        validFrom: data.validFrom || new Date(),
        translations: {
          create: data.translations
        }
      },
      include: {
        translations: true
      }
    })
  }

  // Get consent statistics
  async getConsentStats() {
    const total = await this.prisma.cookieConsent.count()
    const categories = await this.prisma.cookieCategory.findMany({
      select: { key: true }
    })

    const stats: Record<string, { accepted: number; rejected: number }> = {}

    for (const category of categories) {
      const accepted = await this.prisma.cookieConsent.count({
        where: {
          categories: {
            path: [category.key],
            equals: true
          }
        }
      })

      stats[category.key] = {
        accepted,
        rejected: total - accepted
      }
    }

    return {
      totalConsents: total,
      categoryStats: stats
    }
  }
}

export const cookieService = new CookieService()
