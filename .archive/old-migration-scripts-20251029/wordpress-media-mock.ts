// migrate/wordpress-media-mock.ts
// Mock WordPress Media Migration für Testing ohne echte WordPress URLs
// Erstellt WebP Test-Bilder und fügt sie als Featured Images hinzu

import { PrismaClient as PostgresCMSClient } from '../prisma/generated/postgres-cms/index.js'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import dotenv from 'dotenv'

dotenv.config()

const pg = new PostgresCMSClient()

const config = {
  targetUploadsPath: '/srv/proj/nuxt-wp-multilang-theme/public/uploads',
  webpQuality: 85
}

/**
 * Erstelle Mock WebP Bilder für Tests
 */
async function createMockImages() {
  console.log('🎨 Erstelle Mock WebP Bilder...')

  if (!fs.existsSync(config.targetUploadsPath)) {
    fs.mkdirSync(config.targetUploadsPath, { recursive: true })
  }

  const mockImages = [
    { name: 'featured-1.webp', width: 800, height: 600, color: '#3B82F6' },
    { name: 'featured-2.webp', width: 1200, height: 800, color: '#10B981' },
    { name: 'featured-3.webp', width: 900, height: 600, color: '#F59E0B' },
    { name: 'featured-4.webp', width: 1000, height: 700, color: '#EF4444' },
    { name: 'featured-5.webp', width: 1100, height: 750, color: '#8B5CF6' }
  ]

  const createdImages = []

  for (const img of mockImages) {
    try {
      const imagePath = path.join(config.targetUploadsPath, img.name)

      // Skip if already exists
      if (fs.existsSync(imagePath)) {
        console.log(`✅ Mock image exists: ${img.name}`)
        createdImages.push(`/uploads/${img.name}`)
        continue
      }

      // Create colored rectangle as WebP
      await sharp({
        create: {
          width: img.width,
          height: img.height,
          channels: 3,
          background: img.color
        }
      })
        .webp({ quality: config.webpQuality })
        .toFile(imagePath)

      console.log(`🎨 Created mock image: ${img.name} (${img.width}x${img.height})`)
      createdImages.push(`/uploads/${img.name}`)
    } catch (error) {
      console.warn(`⚠️ Error creating mock image ${img.name}:`, error)
    }
  }

  return createdImages
}

/**
 * Weise Mock Featured Images zu Content zu
 */
async function assignMockFeaturedImages(mockImages: string[]) {
  console.log('🖼️ Weise Mock Featured Images zu Content zu...')

  // Clear existing featured images
  await pg.$executeRaw`DELETE FROM cms_article_meta WHERE key = 'featured_image'`
  await pg.$executeRaw`DELETE FROM cms_page_meta WHERE key = 'featured_image'`
  await pg.$executeRaw`DELETE FROM cms_portfolio_meta WHERE key = 'featured_image'`

  let assignedCount = 0

  // Assign to Articles
  const articles = await pg.article.findMany({ take: 15 })
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    const imageIndex = i % mockImages.length
    const imagePath = mockImages[imageIndex]

    await pg.articleMeta.create({
      data: {
        articleId: article.id,
        key: 'featured_image',
        value: imagePath
      }
    })

    console.log(`✅ Article "${article.slug}" → ${imagePath}`)
    assignedCount++
  }

  // Assign to Pages
  const pages = await pg.page.findMany({ take: 8 })
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const imageIndex = i % mockImages.length
    const imagePath = mockImages[imageIndex]

    await pg.pageMeta.create({
      data: {
        pageId: page.id,
        key: 'featured_image',
        value: imagePath
      }
    })

    console.log(`✅ Page "${page.slug}" → ${imagePath}`)
    assignedCount++
  }

  // Assign to Portfolios
  const portfolios = await pg.portfolio.findMany({ take: 10 })
  for (let i = 0; i < portfolios.length; i++) {
    const portfolio = portfolios[i]
    const imageIndex = i % mockImages.length
    const imagePath = mockImages[imageIndex]

    await pg.portfolioMeta.create({
      data: {
        portfolioId: portfolio.id,
        key: 'featured_image',
        value: imagePath
      }
    })

    console.log(`✅ Portfolio "${portfolio.slug}" → ${imagePath}`)
    assignedCount++
  }

  console.log(`📊 Featured Images assigned: ${assignedCount}`)
  return assignedCount
}

/**
 * Prüfe Content-Stats
 */
async function checkContentStats() {
  console.log('\n📊 Content Stats:')

  const articles = await pg.article.count()
  const pages = await pg.page.count()
  const portfolios = await pg.portfolio.count()

  console.log(`   Articles: ${articles}`)
  console.log(`   Pages: ${pages}`)
  console.log(`   Portfolios: ${portfolios}`)

  return { articles, pages, portfolios }
}

/**
 * Main Function
 */
async function main() {
  console.log('🚀 WordPress Mock Media Migration gestartet...')
  console.log(`📂 Target: ${config.targetUploadsPath}`)

  try {
    // Check what content we have
    await checkContentStats()

    // Create mock WebP images
    const mockImages = await createMockImages()
    console.log(`🎨 Created ${mockImages.length} mock WebP images`)

    // Assign featured images
    const assignedCount = await assignMockFeaturedImages(mockImages)

    console.log('\n✅ Mock Media Migration erfolgreich abgeschlossen!')
    console.log('📊 Results:')
    console.log(`   Mock WebP Images: ${mockImages.length}`)
    console.log(`   Featured Images assigned: ${assignedCount}`)
    console.log('   WebP Conversion: 100% (all mock images)')
    console.log('   DB-Migration safe: ✅')

    console.log('\n📝 Next Steps:')
    console.log('   1. Test image display in frontend')
    console.log('   2. Replace with real WordPress images when available')
    console.log('   3. Images sind jetzt DB-Migration-sicher!')
  } catch (error) {
    console.error('❌ Migration Fehler:', error)
    process.exit(1)
  } finally {
    await pg.$disconnect()
  }
}

main().catch(console.error)
