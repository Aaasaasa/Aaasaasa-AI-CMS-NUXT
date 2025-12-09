// server/api/admin/cookies/seed.post.ts
import { cookieService } from '../../../services/cookie.service'

export default defineEventHandler(async () => {
  try {
    // Create Cookie Categories
    const categories = [
      {
        key: 'essential',
        name: 'Erforderliche Cookies',
        description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich.',
        required: true,
        enabled: true,
        sortOrder: 1,
        translations: [
          {
            lang: 'de',
            name: 'Erforderliche Cookies',
            description:
              'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.'
          },
          {
            lang: 'en',
            name: 'Essential Cookies',
            description:
              'These cookies are necessary for the basic functions of the website and cannot be disabled.'
          }
        ]
      },
      {
        key: 'analytics',
        name: 'Analyse-Cookies',
        description: 'Diese Cookies helfen uns, die Nutzung unserer Website zu verstehen.',
        required: false,
        enabled: true,
        sortOrder: 2,
        translations: [
          {
            lang: 'de',
            name: 'Analyse-Cookies',
            description:
              'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und übermitteln.'
          },
          {
            lang: 'en',
            name: 'Analytics Cookies',
            description:
              'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.'
          }
        ]
      },
      {
        key: 'marketing',
        name: 'Marketing-Cookies',
        description: 'Diese Cookies werden verwendet, um Ihnen relevante Werbung zu zeigen.',
        required: false,
        enabled: true,
        sortOrder: 3,
        translations: [
          {
            lang: 'de',
            name: 'Marketing-Cookies',
            description:
              'Diese Cookies werden von Werbepartnern verwendet, um ein Profil Ihrer Interessen zu erstellen und Ihnen relevante Werbung auf anderen Websites zu zeigen.'
          },
          {
            lang: 'en',
            name: 'Marketing Cookies',
            description:
              'These cookies are used by advertising partners to build a profile of your interests and show you relevant advertisements on other websites.'
          }
        ]
      },
      {
        key: 'preferences',
        name: 'Präferenz-Cookies',
        description: 'Diese Cookies speichern Ihre Einstellungen und Präferenzen.',
        required: false,
        enabled: true,
        sortOrder: 4,
        translations: [
          {
            lang: 'de',
            name: 'Präferenz-Cookies',
            description:
              'Diese Cookies ermöglichen es unserer Website, sich an von Ihnen getroffene Entscheidungen zu erinnern und personalisierte Features bereitzustellen.'
          },
          {
            lang: 'en',
            name: 'Preference Cookies',
            description:
              'These cookies allow our website to remember choices you have made and provide enhanced, personalized features.'
          }
        ]
      }
    ]

    const createdCategories: any[] = []
    for (const category of categories) {
      const created = await cookieService.createCookieCategory(category)
      createdCategories.push(created)
    }

    // Create Cookies for each category
    const cookies = [
      // Essential Cookies
      {
        categoryId: createdCategories.find((c) => c.key === 'essential')?.id,
        name: 'nuxt-session',
        domain: '.example.com',
        duration: 'Session',
        purpose: 'Verwaltet die Benutzersitzung und Authentifizierung',
        provider: 'Nuxt.js',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose:
              'Verwaltet die Benutzersitzung und Authentifizierung. Erforderlich für eingeloggte Benutzer.',
            provider: 'Nuxt.js (Eigenentwicklung)'
          },
          {
            lang: 'en',
            purpose: 'Manages user session and authentication. Required for logged-in users.',
            provider: 'Nuxt.js (First-party)'
          }
        ]
      },
      {
        categoryId: createdCategories.find((c) => c.key === 'essential')?.id,
        name: 'cookie-consent',
        domain: '.example.com',
        duration: '1 Jahr',
        purpose: 'Speichert Ihre Cookie-Einstellungen',
        provider: 'Eigenentwicklung',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose: 'Speichert Ihre Cookie-Einstellungen und -präferenzen',
            provider: 'Eigenentwicklung'
          },
          {
            lang: 'en',
            purpose: 'Stores your cookie settings and preferences',
            provider: 'First-party'
          }
        ]
      },
      // Analytics Cookies
      {
        categoryId: createdCategories.find((c) => c.key === 'analytics')?.id,
        name: '_ga',
        domain: '.example.com',
        duration: '2 Jahre',
        purpose: 'Unterscheidet Benutzer für Google Analytics',
        provider: 'Google Analytics',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose:
              'Wird verwendet, um Benutzer zu unterscheiden. Sammelt anonyme Statistiken über Website-Nutzung.',
            provider: 'Google LLC'
          },
          {
            lang: 'en',
            purpose:
              'Used to distinguish users. Collects anonymous statistics about website usage.',
            provider: 'Google LLC'
          }
        ]
      },
      {
        categoryId: createdCategories.find((c) => c.key === 'analytics')?.id,
        name: '_ga_*',
        domain: '.example.com',
        duration: '2 Jahre',
        purpose: 'Sammelt Daten zur Anzahl der Besuche und zum Verhalten',
        provider: 'Google Analytics 4',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose:
              'Sammelt Daten zur Anzahl der Besuche, der durchschnittlichen Verweildauer und welche Seiten geladen wurden.',
            provider: 'Google LLC'
          },
          {
            lang: 'en',
            purpose:
              'Collects data on the number of visits, average time spent, and which pages were loaded.',
            provider: 'Google LLC'
          }
        ]
      },
      // Marketing Cookies
      {
        categoryId: createdCategories.find((c) => c.key === 'marketing')?.id,
        name: '_fbp',
        domain: '.example.com',
        duration: '90 Tage',
        purpose: 'Facebook Pixel für Conversion-Tracking',
        provider: 'Facebook/Meta',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose:
              'Wird vom Facebook Pixel verwendet, um Conversions zu verfolgen und personalisierte Werbung zu schalten.',
            provider: 'Meta Platforms Ireland Limited'
          },
          {
            lang: 'en',
            purpose:
              'Used by Facebook Pixel to track conversions and deliver personalized advertising.',
            provider: 'Meta Platforms Ireland Limited'
          }
        ]
      },
      // Preference Cookies
      {
        categoryId: createdCategories.find((c) => c.key === 'preferences')?.id,
        name: 'theme',
        domain: '.example.com',
        duration: '1 Jahr',
        purpose: 'Speichert Ihre bevorzugte Farbschema-Einstellung',
        provider: 'Eigenentwicklung',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose: 'Speichert Ihre bevorzugte Farbschema-Einstellung (Hell/Dunkel-Modus)',
            provider: 'Eigenentwicklung'
          },
          {
            lang: 'en',
            purpose: 'Stores your preferred color scheme setting (Light/Dark mode)',
            provider: 'First-party'
          }
        ]
      },
      {
        categoryId: createdCategories.find((c) => c.key === 'preferences')?.id,
        name: 'language',
        domain: '.example.com',
        duration: '1 Jahr',
        purpose: 'Speichert Ihre bevorzugte Spracheinstellung',
        provider: 'Eigenentwicklung',
        enabled: true,
        translations: [
          {
            lang: 'de',
            purpose: 'Speichert Ihre bevorzugte Spracheinstellung für die Website',
            provider: 'Eigenentwicklung'
          },
          {
            lang: 'en',
            purpose: 'Stores your preferred language setting for the website',
            provider: 'First-party'
          }
        ]
      }
    ]

    const createdCookies = []
    for (const cookie of cookies) {
      if (cookie.categoryId) {
        const created = await cookieService.createCookie(cookie)
        createdCookies.push(created)
      }
    }

    // Create Cookie Policy
    const policy = await cookieService.createCookiePolicy({
      version: '1.0',
      isActive: true,
      validFrom: new Date(),
      translations: [
        {
          lang: 'de',
          title: 'Cookie-Richtlinie',
          content: `
            <h2>Was sind Cookies?</h2>
            <p>Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät gespeichert werden, wenn Sie unsere Website besuchen. Sie werden häufig verwendet, um Websites funktionsfähig zu machen oder effizienter zu arbeiten, sowie um Informationen an die Eigentümer der Website zu übermitteln.</p>

            <h2>Wie verwenden wir Cookies?</h2>
            <p>Wir verwenden Cookies für verschiedene Zwecke:</p>
            <ul>
              <li><strong>Erforderliche Cookies:</strong> Diese sind für die Funktionsfähigkeit unserer Website unerlässlich</li>
              <li><strong>Analyse-Cookies:</strong> Diese helfen uns zu verstehen, wie Besucher unsere Website nutzen</li>
              <li><strong>Marketing-Cookies:</strong> Diese werden verwendet, um Ihnen relevante Werbung zu zeigen</li>
              <li><strong>Präferenz-Cookies:</strong> Diese speichern Ihre Einstellungen und Präferenzen</li>
            </ul>

            <h2>Ihre Rechte</h2>
            <p>Sie haben das Recht, Ihre Cookie-Einstellungen jederzeit zu ändern oder zu widerrufen. Sie können dies über die Cookie-Einstellungen auf unserer Website tun.</p>

            <h2>Kontakt</h2>
            <p>Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns bitte unter: <a href="mailto:privacy@example.com">privacy@example.com</a></p>
          `,
          bannerText:
            'Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. Durch die weitere Nutzung stimmen Sie unserer Cookie-Richtlinie zu.',
          acceptText: 'Alle akzeptieren',
          rejectText: 'Nur erforderliche',
          settingsText: 'Einstellungen anpassen'
        },
        {
          lang: 'en',
          title: 'Cookie Policy',
          content: `
            <h2>What are Cookies?</h2>
            <p>Cookies are small text files that are stored on your computer or mobile device when you visit our website. They are commonly used to make websites work more efficiently and to provide information to website owners.</p>

            <h2>How do we use Cookies?</h2>
            <p>We use cookies for various purposes:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> These are essential for our website to function properly</li>
              <li><strong>Analytics Cookies:</strong> These help us understand how visitors use our website</li>
              <li><strong>Marketing Cookies:</strong> These are used to show you relevant advertising</li>
              <li><strong>Preference Cookies:</strong> These store your settings and preferences</li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to change or revoke your cookie settings at any time. You can do this through the cookie settings on our website.</p>

            <h2>Contact</h2>
            <p>For questions about our cookie policy, please contact us at: <a href="mailto:privacy@example.com">privacy@example.com</a></p>
          `,
          bannerText:
            'This website uses cookies to provide you with the best possible experience. By continuing to use this site, you agree to our cookie policy.',
          acceptText: 'Accept All',
          rejectText: 'Essential Only',
          settingsText: 'Customize Settings'
        }
      ]
    })

    return {
      success: true,
      message: 'Cookie System erfolgreich initialisiert',
      data: {
        categories: createdCategories.length,
        cookies: createdCookies.length,
        policy: policy.version
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Fehler beim Initialisieren des Cookie Systems: ${error.message}`
    })
  }
})
