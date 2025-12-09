// app/composables/useCookieManager.ts

interface CookieCategory {
  id: number
  key: string
  name: string
  description?: string
  required: boolean
  enabled: boolean
  cookies: Array<{
    id: number
    name: string
    domain?: string
    duration?: string
    purpose: string
    provider?: string
  }>
}

interface CookiePolicy {
  id: number
  version: string
  validFrom: string
  title: string
  content: string
  bannerText: string
  acceptText: string
  rejectText: string
  settingsText: string
}

interface CookieConsent {
  consentId: string
  categories: Record<string, boolean>
  policyVersion: string
  timestamp: number
}

export const useCookieManager = () => {
  const { locale } = useI18n()

  // Reactive state
  const cookiePolicy = ref<CookiePolicy | null>(null)
  const cookieCategories = ref<CookieCategory[]>([])
  const consent = ref<CookieConsent | null>(null)
  const showBanner = ref(false)
  const showSettings = ref(false)
  const isLoaded = ref(false)

  // Generate unique consent ID based on browser fingerprint
  const generateConsentId = (): string => {
    if (import.meta.client) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx?.fillText('Cookie Consent', 10, 50)
      const fingerprint = canvas.toDataURL()

      const data = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fingerprint: fingerprint.slice(-50)
      }

      return btoa(JSON.stringify(data))
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 32)
    }
    return 'ssr-fallback-' + Date.now()
  }

  // Local storage helpers
  const CONSENT_KEY = 'cookie-consent'
  const BANNER_DISMISSED_KEY = 'cookie-banner-dismissed'

  const saveConsentToStorage = (consentData: CookieConsent) => {
    if (import.meta.client) {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData))
    }
  }

  const loadConsentFromStorage = (): CookieConsent | null => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(CONSENT_KEY)
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    }
    return null
  }

  const isBannerDismissed = (): boolean => {
    if (import.meta.client) {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
    }
    return false
  }

  const dismissBanner = () => {
    if (import.meta.client) {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
    }
    showBanner.value = false
  }

  // Fallback data when API fails
  const getFallbackPolicy = (): CookiePolicy => ({
    id: 1,
    version: '1.0',
    validFrom: new Date().toISOString(),
    title: 'Cookie-Einstellungen',
    content: 'Diese Website verwendet Cookies.',
    bannerText: 'Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.',
    acceptText: 'Alle akzeptieren',
    rejectText: 'Nur erforderliche',
    settingsText: 'Einstellungen'
  })

  const getFallbackCategories = (): CookieCategory[] => {
    const currentDomain = import.meta.client ? window.location.hostname : 'example.com'

    return [
      {
        id: 1,
        key: 'essential',
        name: 'Erforderliche Cookies',
        description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich.',
        required: true,
        enabled: true,
        cookies: [
          {
            id: 1,
            name: 'cookie-consent',
            domain: currentDomain,
            duration: '1 Jahr',
            purpose: 'Speichert Ihre Cookie-Einstellungen',
            provider: 'Eigenentwicklung'
          }
        ]
      },
      {
        id: 2,
        key: 'analytics',
        name: 'Analyse-Cookies',
        description: 'Diese Cookies helfen uns, die Nutzung unserer Website zu verstehen.',
        required: false,
        enabled: true,
        cookies: [
          {
            id: 2,
            name: '_ga',
            domain: currentDomain,
            duration: '2 Jahre',
            purpose: 'Google Analytics Benutzeridentifikation',
            provider: 'Google LLC'
          }
        ]
      },
      {
        id: 3,
        key: 'marketing',
        name: 'Marketing-Cookies',
        description: 'Diese Cookies werden für personalisierte Werbung verwendet.',
        required: false,
        enabled: true,
        cookies: []
      },
      {
        id: 4,
        key: 'preferences',
        name: 'Präferenz-Cookies',
        description: 'Diese Cookies speichern Ihre persönlichen Einstellungen.',
        required: false,
        enabled: true,
        cookies: []
      }
    ]
  }

  // API calls with fallback
  const fetchCookiePolicy = async () => {
    try {
      const { data } = await $fetch<{ success: boolean; data: CookiePolicy }>(
        '/api/cookies/policy',
        {
          query: { lang: locale.value }
        }
      )
      cookiePolicy.value = data
      return data
    } catch {
      // Use fallback data
      const fallback = getFallbackPolicy()
      cookiePolicy.value = fallback
      return fallback
    }
  }

  const fetchCookieCategories = async () => {
    try {
      const { data } = await $fetch<{ success: boolean; data: CookieCategory[] }>(
        '/api/cookies/categories',
        {
          query: { lang: locale.value }
        }
      )
      cookieCategories.value = data
      return data
    } catch {
      // Use fallback data
      const fallback = getFallbackCategories()
      cookieCategories.value = fallback
      return fallback
    }
  }

  const saveConsent = async (categories: Record<string, boolean>) => {
    if (!cookiePolicy.value) return

    const consentId = generateConsentId()
    const consentData: CookieConsent = {
      consentId,
      categories,
      policyVersion: cookiePolicy.value.version,
      timestamp: Date.now()
    }

    try {
      // Save to server (optional - continue even if fails)
      if (import.meta.client) {
        await $fetch('/api/cookies/consent', {
          method: 'POST',
          body: {
            consentId,
            categories,
            policyVersion: cookiePolicy.value.version
          }
        }).catch(() => {
          // Server save failed, but continue with local save
        })
      }
    } catch {
      // Continue with local save even if server fails
    }

    // Always save locally and apply settings
    consent.value = consentData
    saveConsentToStorage(consentData)
    dismissBanner()

    // Apply cookie settings
    applyCookieSettings(categories)

    return consentData
  }

  // Cookie management
  const applyCookieSettings = (categories: Record<string, boolean>) => {
    if (!import.meta.client) return

    // Remove all non-essential cookies if not consented
    Object.entries(categories).forEach(([category, accepted]) => {
      if (!accepted && category !== 'essential') {
        // Remove category-specific cookies
        const categoryData = cookieCategories.value.find((c) => c.key === category)
        if (categoryData) {
          categoryData.cookies.forEach((cookie) => {
            // Remove the cookie
            document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            if (cookie.domain) {
              document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookie.domain}`
            }
          })
        }
      }
    })

    // Trigger GTM/Analytics events based on consent
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'cookie_consent_update',
        cookie_preferences: categories
      })
    }

    // Load analytics scripts if consented
    if (categories.analytics) {
      loadAnalyticsScripts()
    }

    if (categories.marketing) {
      loadMarketingScripts()
    }
  }

  const loadAnalyticsScripts = () => {
    // Google Analytics example
    if (import.meta.client && !document.querySelector('#gtag-script')) {
      // Initialize dataLayer if not exists
      window.dataLayer = window.dataLayer || []

      // Define gtag function
      window.gtag = function (...args: any[]) {
        window.dataLayer.push(args)
      }

      // Initialize with current date
      window.gtag('js', new Date())
      window.gtag('config', 'GA_MEASUREMENT_ID')

      // Load the script
      const script = document.createElement('script')
      script.id = 'gtag-script'
      script.async = true
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
      document.head.appendChild(script)
    }
  }

  const loadMarketingScripts = () => {
    // Facebook Pixel, etc.
    // Implementation depends on specific marketing tools
  }

  // Convenience methods
  const acceptAll = async () => {
    const categories: Record<string, boolean> = {}
    cookieCategories.value.forEach((category) => {
      categories[category.key] = true
    })
    await saveConsent(categories)
  }

  const rejectAll = async () => {
    const categories: Record<string, boolean> = {}
    cookieCategories.value.forEach((category) => {
      // Essential cookies are always accepted
      categories[category.key] = category.required
    })
    await saveConsent(categories)
  }

  const acceptCategory = async (categoryKey: string) => {
    if (!consent.value) return

    const newCategories = { ...consent.value.categories }
    newCategories[categoryKey] = true
    await saveConsent(newCategories)
  }

  const rejectCategory = async (categoryKey: string) => {
    if (!consent.value) return

    const category = cookieCategories.value.find((c) => c.key === categoryKey)
    if (category?.required) return // Can't reject essential cookies

    const newCategories = { ...consent.value.categories }
    newCategories[categoryKey] = false
    await saveConsent(newCategories)
  }

  // Check if specific category is consented
  const isCategoryAccepted = (categoryKey: string): boolean => {
    return consent.value?.categories[categoryKey] ?? false
  }

  // Initialize cookie manager
  const initialize = async () => {
    if (isLoaded.value) return

    // Load cookie policy and categories
    await Promise.all([fetchCookiePolicy(), fetchCookieCategories()])

    // Load existing consent
    const storedConsent = loadConsentFromStorage()

    if (storedConsent && cookiePolicy.value) {
      // Check if policy version is still valid
      if (storedConsent.policyVersion === cookiePolicy.value.version) {
        consent.value = storedConsent
        applyCookieSettings(storedConsent.categories)
      } else {
        // Policy updated, show banner again
        showBanner.value = !isBannerDismissed()
      }
    } else {
      // No consent yet, show banner
      showBanner.value = !isBannerDismissed()
    }

    isLoaded.value = true
  }

  // Open settings modal
  const openSettings = () => {
    showSettings.value = true
  }

  const closeSettings = () => {
    showSettings.value = false
  }

  return {
    // State
    cookiePolicy: readonly(cookiePolicy),
    cookieCategories: readonly(cookieCategories),
    consent: readonly(consent),
    showBanner: readonly(showBanner),
    showSettings: readonly(showSettings),
    isLoaded: readonly(isLoaded),

    // Methods
    initialize,
    acceptAll,
    rejectAll,
    acceptCategory,
    rejectCategory,
    saveConsent,
    isCategoryAccepted,
    openSettings,
    closeSettings,
    dismissBanner
  }
}

// Global types for window extensions
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
