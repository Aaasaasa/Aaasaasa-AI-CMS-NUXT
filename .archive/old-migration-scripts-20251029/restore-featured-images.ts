// migrate/restore-featured-images.ts
// Echte WordPress Featured Images wiederherstellen

import { PrismaClient as MySQLClient } from '../prisma/generated/mysql/index.js'
import { PrismaClient as PostgresCMSClient } from '../prisma/generated/postgres-cms/index.js'
import dotenv from 'dotenv'

dotenv.config()

const mysql = new MySQLClient()
const pg = new PostgresCMSClient()

interface MigrationConfig {
  wpPrefix: string
}

const config: MigrationConfig = {
  wpPrefix: process.env.DB_PREFIX || 'as_'
}

// Get table name with prefix
function getTableName(table: string): string {
  return `${config.wpPrefix}${table}`
}

/**
 * Hole WordPress Featured Images und URL-Mapping
 */
async function getWordPressFeaturedImages() {
  console.log('🔍 Hole WordPress Featured Images...')

  // Hole alle _thumbnail_id Metadaten
  const featuredImageMetas = (await mysql.$queryRawUnsafe(`
    SELECT
      pm.post_id,
      pm.meta_value as attachment_id,
      p.post_type
    FROM ${getTableName('postmeta')} pm
    JOIN ${getTableName('posts')} p ON pm.post_id = p.ID
    WHERE pm.meta_key = '_thumbnail_id'
    AND pm.meta_value != ''
    AND p.post_status = 'publish'
    ORDER BY p.ID
  `)) as any[]

  console.log(`📊 Found ${featuredImageMetas.length} featured images in WordPress`)

  // Hole die echten Attachment-URLs
  const imageUrls = new Map<string, string>()

  for (const meta of featuredImageMetas) {
    try {
      // Hole attachment URL
      const attachmentUrl = (await mysql.$queryRawUnsafe(`
        SELECT meta_value as file_path
        FROM ${getTableName('postmeta')}
        WHERE post_id = ${meta.attachment_id}
        AND meta_key = '_wp_attached_file'
        LIMIT 1
      `)) as any[]

      if (attachmentUrl.length > 0) {
        const filePath = attachmentUrl[0].file_path
        const fullUrl = `/uploads/${filePath}`
        imageUrls.set(`${meta.post_id}_${meta.post_type}`, fullUrl)

        console.log(`📷 Post ${meta.post_id} (${meta.post_type}) → ${fullUrl}`)
      }
    } catch (error) {
      console.warn(`⚠️ Error getting attachment for post ${meta.post_id}:`, error)
    }
  }

  return imageUrls
}

/**
 * Update PostgreSQL Featured Images
 */
async function updatePostgresFeaturedImages(imageUrls: Map<string, string>) {
  console.log('🔄 Update PostgreSQL Featured Images...')

  let updatedCount = 0

  // Clear existing mock featured images first
  console.log('🧹 Remove mock featured images...')
  await pg.$executeRaw`DELETE FROM cms_article_meta WHERE key = 'featured_image' AND value::text LIKE '%featured-%'`
  await pg.$executeRaw`DELETE FROM cms_page_meta WHERE key = 'featured_image' AND value::text LIKE '%featured-%'`
  await pg.$executeRaw`DELETE FROM cms_portfolio_meta WHERE key = 'featured_image' AND value::text LIKE '%featured-%'`

  // Hole alle WordPress posts die zu Articles migriert wurden
  const wpPosts = (await mysql.$queryRawUnsafe(`
    SELECT ID, post_name, post_type
    FROM ${getTableName('posts')}
    WHERE post_status = 'publish'
    AND post_type IN ('post', 'page', 'avada_portfolio')
    ORDER BY ID
  `)) as any[]

  for (const wpPost of wpPosts) {
    const imageKey = `${wpPost.ID}_${wpPost.post_type}`
    const imageUrl = imageUrls.get(imageKey)

    if (!imageUrl) continue

    try {
      if (wpPost.post_type === 'post') {
        // Update Article
        const article = await pg.article.findUnique({
          where: { slug: wpPost.post_name }
        })

        if (article) {
          // Prüfe ob bereits eine featured_image existiert
          const existingMeta = await pg.articleMeta.findFirst({
            where: {
              articleId: article.id,
              key: 'featured_image'
            }
          })

          if (existingMeta) {
            await pg.articleMeta.update({
              where: { id: existingMeta.id },
              data: { value: imageUrl }
            })
          } else {
            await pg.articleMeta.create({
              data: {
                articleId: article.id,
                key: 'featured_image',
                value: imageUrl
              }
            })
          }

          console.log(`✅ Article "${wpPost.post_name}" → ${imageUrl}`)
          updatedCount++
        }
      } else if (wpPost.post_type === 'page') {
        // Update Page
        const page = await pg.page.findUnique({
          where: { slug: wpPost.post_name }
        })

        if (page) {
          const existingMeta = await pg.pageMeta.findFirst({
            where: {
              pageId: page.id,
              key: 'featured_image'
            }
          })

          if (existingMeta) {
            await pg.pageMeta.update({
              where: { id: existingMeta.id },
              data: { value: imageUrl }
            })
          } else {
            await pg.pageMeta.create({
              data: {
                pageId: page.id,
                key: 'featured_image',
                value: imageUrl
              }
            })
          }

          console.log(`✅ Page "${wpPost.post_name}" → ${imageUrl}`)
          updatedCount++
        }
      } else if (wpPost.post_type === 'avada_portfolio') {
        // Update Portfolio
        const portfolio = await pg.portfolio.findUnique({
          where: { slug: wpPost.post_name }
        })

        if (portfolio) {
          const existingMeta = await pg.portfolioMeta.findFirst({
            where: {
              portfolioId: portfolio.id,
              key: 'featured_image'
            }
          })

          if (existingMeta) {
            await pg.portfolioMeta.update({
              where: { id: existingMeta.id },
              data: { value: imageUrl }
            })
          } else {
            await pg.portfolioMeta.create({
              data: {
                portfolioId: portfolio.id,
                key: 'featured_image',
                value: imageUrl
              }
            })
          }

          console.log(`✅ Portfolio "${wpPost.post_name}" → ${imageUrl}`)
          updatedCount++
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error updating ${wpPost.post_type} ${wpPost.post_name}:`, error)
    }
  }

  return updatedCount
}

/**
 * Prüfe Missing Images
 */
async function checkMissingImages(imageUrls: Map<string, string>) {
  console.log('🔍 Prüfe fehlende Bilder...')

  const fs = await import('fs')
  const path = await import('path')

  const uploadsPath = '/srv/proj/nuxt-wp-multilang-theme/public'
  const missingImages: string[] = []
  const existingImages: string[] = []

  for (const imageUrl of imageUrls.values()) {
    const fullPath = path.join(uploadsPath, imageUrl)

    if (fs.existsSync(fullPath)) {
      existingImages.push(imageUrl)
    } else {
      missingImages.push(imageUrl)
    }
  }

  console.log(`📊 Image Status:`)
  console.log(`   Existing: ${existingImages.length}`)
  console.log(`   Missing: ${missingImages.length}`)

  if (missingImages.length > 0) {
    console.log('\n⚠️ Missing Images:')
    missingImages.slice(0, 10).forEach((img) => console.log(`   ${img}`))
    if (missingImages.length > 10) {
      console.log(`   ... und ${missingImages.length - 10} weitere`)
    }
  }

  return { existing: existingImages.length, missing: missingImages.length }
}

/**
 * Main Function
 */
async function main() {
  console.log('🚀 WordPress Featured Images Restore gestartet...')

  try {
    // Hole WordPress Featured Images
    const imageUrls = await getWordPressFeaturedImages()

    if (imageUrls.size === 0) {
      console.log('❌ Keine Featured Images in WordPress gefunden')
      return
    }

    // Prüfe fehlende Bilder
    const imageStats = await checkMissingImages(imageUrls)

    // Update PostgreSQL
    const updatedCount = await updatePostgresFeaturedImages(imageUrls)

    console.log('\n✅ Featured Images Restore abgeschlossen!')
    console.log('📊 Results:')
    console.log(`   WordPress Featured Images: ${imageUrls.size}`)
    console.log(`   PostgreSQL Updates: ${updatedCount}`)
    console.log(`   Images Found: ${imageStats.existing}`)
    console.log(`   Images Missing: ${imageStats.missing}`)

    if (imageStats.missing > 0) {
      console.log('\n📝 Next Steps:')
      console.log('   1. Kopiere WordPress wp-content/uploads/ nach public/uploads/')
      console.log('   2. Oder führe WordPress Media Migration aus')
      console.log('   3. Bilder werden dann korrekt angezeigt')
    } else {
      console.log('\n✅ All images available - Featured Images should display correctly!')
    }
  } catch (error) {
    console.error('❌ Restore Fehler:', error)
    process.exit(1)
  } finally {
    await mysql.$disconnect()
    await pg.$disconnect()
  }
}

main().catch(console.error)
