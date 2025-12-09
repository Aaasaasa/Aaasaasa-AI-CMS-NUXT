// prisma/seed-data/cookie-policies.ts

export async function seedCookiePolicies(prisma: any) {
  // Create cookie categories first
  const essentialCategory = await prisma.cookieCategory.upsert({
    where: { key: 'essential' },
    update: {},
    create: {
      key: 'essential',
      name: 'Erforderliche Cookies',
      description:
        'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.',
      required: true,
      enabled: true,
      order: 1
    }
  })

  const analyticsCategory = await prisma.cookieCategory.upsert({
    where: { key: 'analytics' },
    update: {},
    create: {
      key: 'analytics',
      name: 'Analyse-Cookies',
      description:
        'Diese Cookies helfen uns dabei, die Nutzung unserer Website zu verstehen und zu verbessern.',
      required: false,
      enabled: true,
      order: 2
    }
  })

  const _marketingCategory = await prisma.cookieCategory.upsert({
    where: { key: 'marketing' },
    update: {},
    create: {
      key: 'marketing',
      name: 'Marketing-Cookies',
      description: 'Diese Cookies werden verwendet, um personalisierte Werbung anzuzeigen.',
      required: false,
      enabled: true,
      order: 3
    }
  })

  const _preferencesCategory = await prisma.cookieCategory.upsert({
    where: { key: 'preferences' },
    update: {},
    create: {
      key: 'preferences',
      name: 'Präferenz-Cookies',
      description: 'Diese Cookies speichern Ihre persönlichen Einstellungen und Präferenzen.',
      required: false,
      enabled: true,
      order: 4
    }
  })

  // Create individual cookies
  await prisma.cookie.upsert({
    where: { name: 'cookie-consent' },
    update: {},
    create: {
      name: 'cookie-consent',
      domain: 'localhost',
      duration: '1 Jahr',
      purpose: 'Speichert Ihre Cookie-Einstellungen und -präferenzen',
      provider: 'Eigenentwicklung',
      categoryId: essentialCategory.id
    }
  })

  await prisma.cookie.upsert({
    where: { name: 'session-token' },
    update: {},
    create: {
      name: 'session-token',
      domain: 'localhost',
      duration: 'Session',
      purpose: 'Authentifizierung und Sitzungsverwaltung',
      provider: 'Eigenentwicklung',
      categoryId: essentialCategory.id
    }
  })

  await prisma.cookie.upsert({
    where: { name: '_ga' },
    update: {},
    create: {
      name: '_ga',
      domain: 'localhost',
      duration: '2 Jahre',
      purpose: 'Google Analytics Benutzeridentifikation',
      provider: 'Google LLC',
      categoryId: analyticsCategory.id
    }
  })

  await prisma.cookie.upsert({
    where: { name: '_gid' },
    update: {},
    create: {
      name: '_gid',
      domain: 'localhost',
      duration: '24 Stunden',
      purpose: 'Google Analytics Sitzungsidentifikation',
      provider: 'Google LLC',
      categoryId: analyticsCategory.id
    }
  })

  // Create cookie policy
  const cookiePolicy = await prisma.cookiePolicy.upsert({
    where: { version: 'v1.0' },
    update: {},
    create: {
      version: 'v1.0',
      validFrom: new Date(),
      isActive: true
    }
  })

  // Create policy translations
  await prisma.cookiePolicyTranslation.upsert({
    where: {
      policyId_language: {
        policyId: cookiePolicy.id,
        language: 'de'
      }
    },
    update: {},
    create: {
      policyId: cookiePolicy.id,
      language: 'de',
      title: 'Cookie-Einstellungen',
      content: `Diese Website verwendet Cookies und ähnliche Technologien, um Ihnen die bestmögliche Nutzererfahrung zu bieten.

**Was sind Cookies?**
Cookies sind kleine Textdateien, die von Websites auf Ihrem Gerät gespeichert werden. Sie helfen uns dabei, die Website funktionsfähig zu machen und Ihre Erfahrung zu verbessern.

**Welche Cookies verwenden wir?**
Wir verwenden verschiedene Arten von Cookies:

- **Erforderliche Cookies**: Diese sind für die Grundfunktionen der Website notwendig
- **Analyse-Cookies**: Helfen uns, die Nutzung der Website zu verstehen
- **Marketing-Cookies**: Werden für personalisierte Werbung verwendet
- **Präferenz-Cookies**: Speichern Ihre persönlichen Einstellungen

**Ihre Kontrolle**
Sie können Ihre Cookie-Einstellungen jederzeit ändern oder Cookies ablehnen. Beachten Sie, dass einige Funktionen möglicherweise nicht verfügbar sind, wenn Sie bestimmte Cookies ablehnen.`,
      bannerText:
        'Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. Sie können Ihre Einstellungen anpassen oder alle Cookies akzeptieren.',
      acceptText: 'Alle akzeptieren',
      rejectText: 'Nur erforderliche',
      settingsText: 'Einstellungen anpassen'
    }
  })

  await prisma.cookiePolicyTranslation.upsert({
    where: {
      policyId_language: {
        policyId: cookiePolicy.id,
        language: 'en'
      }
    },
    update: {},
    create: {
      policyId: cookiePolicy.id,
      language: 'en',
      title: 'Cookie Settings',
      content: `This website uses cookies and similar technologies to provide you with the best possible user experience.

**What are cookies?**
Cookies are small text files that are stored by websites on your device. They help us make the website functional and improve your experience.

**Which cookies do we use?**
We use different types of cookies:

- **Essential cookies**: These are necessary for the basic functions of the website
- **Analytics cookies**: Help us understand how the website is used
- **Marketing cookies**: Used for personalized advertising
- **Preference cookies**: Store your personal settings

**Your control**
You can change your cookie settings at any time or reject cookies. Please note that some features may not be available if you reject certain cookies.`,
      bannerText:
        'This website uses cookies to provide you with the best possible experience. You can adjust your settings or accept all cookies.',
      acceptText: 'Accept all',
      rejectText: 'Essential only',
      settingsText: 'Customize settings'
    }
  })

  return {
    success: true,
    policy: cookiePolicy,
    categoriesCount: 4,
    cookiesCount: 4
  }
}
