// migrate/fix-featured-images.ts
// Fix Featured Images: Convert _thumbnail_id back to real image paths

import { PrismaClient as PostgresCMSClient } from '../prisma/generated/postgres-cms/index.js'
import dotenv from 'dotenv'

dotenv.config()

const pg = new PostgresCMSClient()

/**
 * Mapping für bekannte WordPress Attachment IDs zu Bildpfaden
 * Diese können aus dem WordPress Dump extrahiert oder manuell gemappt werden
 */
const ATTACHMENT_ID_TO_PATH: Record<string, string> = {
  // Beispiel-Mappings - diese müssen an echte WordPress Daten angepasst werden
  '13847': '2024/10/web-development-1.webp',
  '13842': '2024/10/server-security.webp',
  '13839': '2024/10/php-installation.webp',
  '13830': '2024/09/npm-conflicts.webp',
  '13819': '2024/09/malware-scanning.webp',
  '13815': '2024/08/wordpress-seo.webp',
  '13810': '2024/08/database-optimization.webp',
  '13805': '2024/07/web-performance.webp',
  '13800': '2024/07/security-headers.webp',
  '13795': '2024/06/ssl-certificates.webp',
  '13790': '2024/06/backup-strategies.webp',
  '13785': '2024/05/cdn-setup.webp',
  '13780': '2024/05/monitoring-tools.webp',
  '13775': '2024/04/load-balancing.webp',
  '13770': '2024/04/docker-containers.webp'
}

/**
 * Konvertiere _thumbnail_id zu featured_image Pfad
 */
async function convertThumbnailIds() {
  console.log('🔄 Konvertiere _thumbnail_id zu featured_image...')

  let convertedCount = 0
  let errors = 0

  // Articles
  console.log('📰 Processing Articles...')
  const articleThumbnails = await pg.articleMeta.findMany({
    where: { key: '_thumbnail_id' },
    include: { article: { select: { slug: true } } }
  })

  for (const meta of articleThumbnails) {
    try {
      const thumbnailId =
        typeof meta.value === 'object' && meta.value && 'raw' in meta.value
          ? (meta.value as any).raw
          : meta.value?.toString()

      if (!thumbnailId) continue

      const imagePath = ATTACHMENT_ID_TO_PATH[thumbnailId]

      if (imagePath) {
        // Update or create featured_image
        const existingFeatured = await pg.articleMeta.findFirst({
          where: {
            articleId: meta.articleId,
            key: 'featured_image'
          }
        })

        const fullImagePath = `/uploads/${imagePath}`

        if (existingFeatured) {
          await pg.articleMeta.update({
            where: { id: existingFeatured.id },
            data: { value: fullImagePath }
          })
        } else {
          await pg.articleMeta.create({
            data: {
              articleId: meta.articleId,
              key: 'featured_image',
              value: fullImagePath
            }
          })
        }

        console.log(`✅ Article "${meta.article.slug}": ${thumbnailId} → ${fullImagePath}`)
        convertedCount++
      } else {
        console.warn(`⚠️ Article "${meta.article.slug}": Unknown thumbnail ID ${thumbnailId}`)
        errors++
      }
    } catch (error) {
      console.error(`❌ Error processing article meta ${meta.id}:`, error)
      errors++
    }
  }

  // Pages
  console.log('\n📄 Processing Pages...')
  const pageThumbnails = await pg.pageMeta.findMany({
    where: { key: '_thumbnail_id' },
    include: { page: { select: { slug: true } } }
  })

  for (const meta of pageThumbnails) {
    try {
      const thumbnailId =
        typeof meta.value === 'object' && meta.value && 'raw' in meta.value
          ? (meta.value as any).raw
          : meta.value?.toString()

      if (!thumbnailId) continue

      const imagePath = ATTACHMENT_ID_TO_PATH[thumbnailId]

      if (imagePath) {
        const existingFeatured = await pg.pageMeta.findFirst({
          where: {
            pageId: meta.pageId,
            key: 'featured_image'
          }
        })

        const fullImagePath = `/uploads/${imagePath}`

        if (existingFeatured) {
          await pg.pageMeta.update({
            where: { id: existingFeatured.id },
            data: { value: fullImagePath }
          })
        } else {
          await pg.pageMeta.create({
            data: {
              pageId: meta.pageId,
              key: 'featured_image',
              value: fullImagePath
            }
          })
        }

        console.log(`✅ Page "${meta.page.slug}": ${thumbnailId} → ${fullImagePath}`)
        convertedCount++
      } else {
        console.warn(`⚠️ Page "${meta.page.slug}": Unknown thumbnail ID ${thumbnailId}`)
        errors++
      }
    } catch (error) {
      console.error(`❌ Error processing page meta ${meta.id}:`, error)
      errors++
    }
  }

  // Portfolios
  console.log('\n🎨 Processing Portfolios...')
  const portfolioThumbnails = await pg.portfolioMeta.findMany({
    where: { key: '_thumbnail_id' },
    include: { portfolio: { select: { slug: true } } }
  })

  for (const meta of portfolioThumbnails) {
    try {
      const thumbnailId =
        typeof meta.value === 'object' && meta.value && 'raw' in meta.value
          ? (meta.value as any).raw
          : meta.value?.toString()

      if (!thumbnailId) continue

      const imagePath = ATTACHMENT_ID_TO_PATH[thumbnailId]

      if (imagePath) {
        const existingFeatured = await pg.portfolioMeta.findFirst({
          where: {
            portfolioId: meta.portfolioId,
            key: 'featured_image'
          }
        })

        const fullImagePath = `/uploads/${imagePath}`

        if (existingFeatured) {
          await pg.portfolioMeta.update({
            where: { id: existingFeatured.id },
            data: { value: fullImagePath }
          })
        } else {
          await pg.portfolioMeta.create({
            data: {
              portfolioId: meta.portfolioId,
              key: 'featured_image',
              value: fullImagePath
            }
          })
        }

        console.log(`✅ Portfolio "${meta.portfolio.slug}": ${thumbnailId} → ${fullImagePath}`)
        convertedCount++
      } else {
        console.warn(`⚠️ Portfolio "${meta.portfolio.slug}": Unknown thumbnail ID ${thumbnailId}`)
        errors++
      }
    } catch (error) {
      console.error(`❌ Error processing portfolio meta ${meta.id}:`, error)
      errors++
    }
  }

  return { converted: convertedCount, errors }
}

/**
 * Zeige alle vorhandenen _thumbnail_id Werte zur Analyse
 */
async function analyzeThumbnailIds() {
  console.log('🔍 Analysiere vorhandene _thumbnail_id Werte...')

  const allThumbnails: Array<{ type: string; slug: string; thumbnailId: string }> = []

  // Articles
  const articleThumbnails = await pg.articleMeta.findMany({
    where: { key: '_thumbnail_id' },
    include: { article: { select: { slug: true } } }
  })

  for (const meta of articleThumbnails) {
    const thumbnailId =
      typeof meta.value === 'object' && meta.value && 'raw' in meta.value
        ? (meta.value as any).raw
        : meta.value?.toString()

    if (thumbnailId) {
      allThumbnails.push({
        type: 'article',
        slug: meta.article.slug,
        thumbnailId
      })
    }
  }

  // Pages
  const pageThumbnails = await pg.pageMeta.findMany({
    where: { key: '_thumbnail_id' },
    include: { page: { select: { slug: true } } }
  })

  for (const meta of pageThumbnails) {
    const thumbnailId =
      typeof meta.value === 'object' && meta.value && 'raw' in meta.value
        ? (meta.value as any).raw
        : meta.value?.toString()

    if (thumbnailId) {
      allThumbnails.push({
        type: 'page',
        slug: meta.page.slug,
        thumbnailId
      })
    }
  }

  // Portfolios
  const portfolioThumbnails = await pg.portfolioMeta.findMany({
    where: { key: '_thumbnail_id' },
    include: { portfolio: { select: { slug: true } } }
  })

  for (const meta of portfolioThumbnails) {
    const thumbnailId =
      typeof meta.value === 'object' && meta.value && 'raw' in meta.value
        ? (meta.value as any).raw
        : meta.value?.toString()

    if (thumbnailId) {
      allThumbnails.push({
        type: 'portfolio',
        slug: meta.portfolio.slug,
        thumbnailId
      })
    }
  }

  console.log('\n📊 Gefundene Thumbnail IDs:')
  allThumbnails.forEach((item) => {
    const mapped = ATTACHMENT_ID_TO_PATH[item.thumbnailId] ? '✅' : '❌'
    console.log(`${mapped} ${item.type.padEnd(10)} ${item.slug.padEnd(30)} ID: ${item.thumbnailId}`)
  })

  const uniqueIds = [...new Set(allThumbnails.map((t) => t.thumbnailId))]
  const mappedIds = uniqueIds.filter((id) => ATTACHMENT_ID_TO_PATH[id])

  console.log(`\n📈 Summary:`)
  console.log(`   Total Items: ${allThumbnails.length}`)
  console.log(`   Unique IDs: ${uniqueIds.length}`)
  console.log(`   Mapped IDs: ${mappedIds.length}`)
  console.log(`   Missing Mappings: ${uniqueIds.length - mappedIds.length}`)

  return { allThumbnails, uniqueIds, mappedIds }
}

/**
 * Main Function
 */
async function main() {
  console.log('🚀 Featured Images Fix gestartet...')

  try {
    // Analysiere erst alle IDs
    const analysis = await analyzeThumbnailIds()

    if (analysis.uniqueIds.length === 0) {
      console.log('❌ Keine _thumbnail_id Werte gefunden')
      return
    }

    // Konvertiere die gemappten IDs
    console.log('\n🔄 Starte Konvertierung...')
    const results = await convertThumbnailIds()

    console.log('\n✅ Featured Images Fix abgeschlossen!')
    console.log('📊 Results:')
    console.log(`   Converted: ${results.converted}`)
    console.log(`   Errors: ${results.errors}`)
    console.log(
      `   Success Rate: ${((results.converted / (results.converted + results.errors)) * 100).toFixed(1)}%`
    )

    if (analysis.uniqueIds.length > analysis.mappedIds.length) {
      console.log('\n📝 Next Steps:')
      console.log('   1. Erweitere ATTACHMENT_ID_TO_PATH mit fehlenden IDs')
      console.log('   2. Führe Script erneut aus')
      console.log('   3. Oder erstelle echte WordPress Bild-Dateien in public/uploads/')
    }
  } catch (error) {
    console.error('❌ Fix Fehler:', error)
    process.exit(1)
  } finally {
    await pg.$disconnect()
  }
}

main().catch(console.error)
