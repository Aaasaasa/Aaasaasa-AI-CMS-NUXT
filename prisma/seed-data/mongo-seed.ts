// prisma/seed-data/mongo-seed.ts
// MongoDB Analytics Seed Data

import { getMongoClient } from '../../server/lib/prisma-utils'

async function seedMongoAnalytics() {
  const prisma = await getMongoClient()

  if (!prisma) {
    throw new Error('MongoDB client not available')
  }

  try {
    // Clean existing data (in development only)
    if (process.env.NODE_ENV !== 'production') {
      await prisma.errorLog.deleteMany()
      await prisma.searchLog.deleteMany()
      await prisma.performanceMetric.deleteMany()
      await prisma.userSession.deleteMany()
      await prisma.pageView.deleteMany()
    }

    const _sampleStartDate = new Date('2024-01-01')
    const _sampleEndDate = new Date()

    // Create sample page views
    const pageViews = [
      {
        path: '/',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100',
        referrer: 'https://google.com',
        language: 'en',
        country: 'US',
        device: 'desktop',
        loadTime: 1200,
        timestamp: new Date('2024-12-01T10:00:00Z')
      },
      {
        path: '/blog',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        ipAddress: '192.168.1.101',
        referrer: 'https://twitter.com',
        language: 'de',
        country: 'DE',
        device: 'mobile',
        loadTime: 800,
        timestamp: new Date('2024-12-01T10:15:00Z')
      },
      {
        path: '/about',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ipAddress: '192.168.1.102',
        referrer: 'direct',
        language: 'sr',
        country: 'RS',
        device: 'desktop',
        loadTime: 950,
        timestamp: new Date('2024-12-01T10:30:00Z')
      },
      {
        path: '/portfolio',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        ipAddress: '192.168.1.103',
        referrer: 'https://github.com',
        language: 'en',
        country: 'CA',
        device: 'desktop',
        loadTime: 1100,
        timestamp: new Date('2024-12-01T11:00:00Z')
      }
    ]

    for (const pageView of pageViews) {
      await prisma.pageView.create({ data: pageView })
    }

    // Create sample user sessions
    const userSessions = [
      {
        sessionId: 'sess_2024120110001',
        userId: 'user_aleksandar',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T10:45:00Z'),
        pagesViewed: 5,
        actions: [
          { type: 'page_view', path: '/', timestamp: new Date('2024-12-01T10:00:00Z') },
          { type: 'page_view', path: '/blog', timestamp: new Date('2024-12-01T10:15:00Z') },
          { type: 'search', query: 'nuxt tutorial', timestamp: new Date('2024-12-01T10:20:00Z') },
          { type: 'page_view', path: '/about', timestamp: new Date('2024-12-01T10:30:00Z') },
          { type: 'page_view', path: '/portfolio', timestamp: new Date('2024-12-01T10:40:00Z') }
        ],
        device: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10',
        country: 'US'
      },
      {
        sessionId: 'sess_2024120111001',
        userId: null,
        startTime: new Date('2024-12-01T11:00:00Z'),
        endTime: new Date('2024-12-01T11:20:00Z'),
        pagesViewed: 3,
        actions: [
          { type: 'page_view', path: '/', timestamp: new Date('2024-12-01T11:00:00Z') },
          { type: 'page_view', path: '/products', timestamp: new Date('2024-12-01T11:10:00Z') },
          {
            type: 'contact_form',
            formId: 'contact-main',
            timestamp: new Date('2024-12-01T11:15:00Z')
          }
        ],
        device: 'mobile',
        browser: 'Safari',
        os: 'iOS 17',
        country: 'DE'
      }
    ]

    for (const session of userSessions) {
      await prisma.userSession.create({ data: session })
    }

    // Create sample performance metrics
    const performanceMetrics = [
      {
        path: '/',
        metric: 'TTFB',
        value: 120.5,
        timestamp: new Date('2024-12-01T10:00:00Z'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        device: 'desktop'
      },
      {
        path: '/',
        metric: 'FCP',
        value: 800.2,
        timestamp: new Date('2024-12-01T10:00:00Z'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        device: 'desktop'
      },
      {
        path: '/',
        metric: 'LCP',
        value: 1200.8,
        timestamp: new Date('2024-12-01T10:00:00Z'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        device: 'desktop'
      },
      {
        path: '/blog',
        metric: 'TTFB',
        value: 95.3,
        timestamp: new Date('2024-12-01T10:15:00Z'),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        device: 'mobile'
      },
      {
        path: '/blog',
        metric: 'FCP',
        value: 650.7,
        timestamp: new Date('2024-12-01T10:15:00Z'),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        device: 'mobile'
      }
    ]

    for (const metric of performanceMetrics) {
      await prisma.performanceMetric.create({ data: metric })
    }

    // Create sample search logs
    const searchLogs = [
      {
        query: 'nuxt tutorial',
        userId: 'user_aleksandar',
        sessionId: 'sess_2024120110001',
        resultsCount: 15,
        clickedResults: ['article_welcome-to-nuxtwo', 'article_multi-database'],
        timestamp: new Date('2024-12-01T10:20:00Z'),
        language: 'en'
      },
      {
        query: 'multi database architecture',
        userId: null,
        sessionId: 'sess_2024120111001',
        resultsCount: 3,
        clickedResults: ['article_multi-database'],
        timestamp: new Date('2024-12-01T11:05:00Z'),
        language: 'de'
      },
      {
        query: 'wordpress integration',
        userId: 'user_aleksandar',
        sessionId: 'sess_2024120110001',
        resultsCount: 8,
        clickedResults: [],
        timestamp: new Date('2024-12-01T10:35:00Z'),
        language: 'en'
      }
    ]

    for (const searchLog of searchLogs) {
      await prisma.searchLog.create({ data: searchLog })
    }

    // Create sample error logs
    const errorLogs = [
      {
        level: 'ERROR',
        message: 'Database connection timeout',
        stack:
          'Error: Database connection timeout\n    at PrismaClient.connect (/app/lib/prisma.ts:45:12)',
        path: '/api/articles',
        method: 'GET',
        statusCode: 500,
        userId: null,
        sessionId: 'sess_2024120112001',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.105',
        timestamp: new Date('2024-12-01T12:00:00Z'),
        context: {
          database: 'postgres',
          operation: 'findMany',
          table: 'articles'
        }
      },
      {
        level: 'WARN',
        message: 'Slow query detected',
        stack: null,
        path: '/api/search',
        method: 'POST',
        statusCode: 200,
        userId: 'user_aleksandar',
        sessionId: 'sess_2024120110001',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ipAddress: '192.168.1.102',
        timestamp: new Date('2024-12-01T10:21:00Z'),
        context: {
          database: 'postgres',
          operation: 'search',
          executionTime: 2500,
          query: 'nuxt tutorial'
        }
      },
      {
        level: 'INFO',
        message: 'User login successful',
        stack: null,
        path: '/api/auth/login',
        method: 'POST',
        statusCode: 200,
        userId: 'user_aleksandar',
        sessionId: 'sess_2024120110001',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.100',
        timestamp: new Date('2024-12-01T09:59:00Z'),
        context: {
          loginMethod: 'email',
          userRole: 'AUTHOR'
        }
      }
    ]

    for (const errorLog of errorLogs) {
      await prisma.errorLog.create({ data: errorLog })
    }

    // Log successful seeding
    process.stdout.write('MongoDB Analytics seeded successfully!\n')
    process.stdout.write('Created:\n')
    process.stdout.write('- 4 page views\n')
    process.stdout.write('- 2 user sessions\n')
    process.stdout.write('- 5 performance metrics\n')
    process.stdout.write('- 3 search logs\n')
    process.stdout.write('- 3 error logs\n')
  } catch (error) {
    process.stderr.write(`Error seeding MongoDB: ${error}\n`)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedMongoAnalytics().catch((error) => {
    process.stderr.write(`Seed failed: ${error}\n`)
    process.exit(1)
  })
}

export default seedMongoAnalytics
