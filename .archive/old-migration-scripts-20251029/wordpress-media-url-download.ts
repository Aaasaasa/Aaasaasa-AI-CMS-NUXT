// migrate/wordpress-media-url-download.ts
// WordPress Media Migration mit URL Download für 100% WebP Conversion
// Lädt Bilder direkt von WordPress URLs herunter und konvertiert zu WebP

import { PrismaClient as MySQLClient } from '../prisma/generated/mysql/index.js'
import { PrismaClient as PostgresCMSClient } from '../prisma/generated/postgres-cms/index.js'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import dotenv from 'dotenv'

dotenv.config()

const mysql = new MySQLClient()
const pg = new PostgresCMSClient()

interface MediaConfig {
  wpPrefix: string
  defaultLanguage: string
  targetUploadsPath: string
  wpBaseUrl: string
  webpQuality: number
  maxWidth: number
  maxHeight: number
}

const config: MediaConfig = {
  wpPrefix: process.env.DB_PREFIX || 'as_',
  defaultLanguage: 'de',
  targetUploadsPath: '/srv/proj/nuxt-wp-multilang-theme/public/uploads',
  wpBaseUrl: process.env.WP_BASE_URL || 'https://your-wordpress-site.com', // WordPress Domain
  webpQuality: 85,
  maxWidth: 1920,
  maxHeight: 1080
}

function getTableName(table: string): string {
  return `${config.wpPrefix}${table}`
}

/**
 * Lade Bild von URL herunter
 */
async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`📥 Downloading: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`❌ Failed to download ${url}: ${response.status}`)
      return false
    }

    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Use arrayBuffer approach to avoid stream type issues
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(outputPath, new Uint8Array(buffer))

    return true
  } catch (error) {
    console.warn(`❌ Download error for ${url}:`, error)
    return false
  }
}

/**
 * Konvertiere Bild zu WebP
 */
async function convertToWebP(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    await sharp(inputPath)
      .resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: config.webpQuality,
        effort: 6
      })
      .toFile(outputPath)

    // Remove original after successful conversion
    fs.unlinkSync(inputPath)
    return true
  } catch (error) {
    console.warn(`⚠️ WebP conversion failed for ${inputPath}:`, error)
    return false
  }
}

/**
 * Verarbeite WordPress URL zu lokalem WebP-Pfad
 */
async function processImageUrl(wpImageUrl: string): Promise<string | null> {
  try {
    // Parse WordPress URL
    const url = new URL(wpImageUrl)
    const urlPath = url.pathname

    // Extract relative path from WordPress uploads
    const uploadsMatch = urlPath.match(/\/wp-content\/uploads\/(.+)$/)
    if (!uploadsMatch) {
      console.warn(`⚠️ Invalid WordPress uploads URL: ${wpImageUrl}`)
      return null
    }

    const relativePath = uploadsMatch[1]
    const fileExt = path.extname(relativePath).toLowerCase()

    // Skip non-images and thumbnails
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
      return null
    }

    if (relativePath.match(/-\d+x\d+\.(jpg|jpeg|png|gif)$/i)) {
      console.log(`⏭️ Skipping thumbnail: ${relativePath}`)
      return null
    }

    // Generate WebP paths
    const fileName = path.basename(relativePath, fileExt)
    const dirPath = path.dirname(relativePath)
    const webpFileName = `${fileName}.webp`
    const webpRelativePath = path.join(dirPath, webpFileName)
    const webpTargetPath = path.join(config.targetUploadsPath, webpRelativePath)

    // Check if WebP already exists
    if (fs.existsSync(webpTargetPath)) {
      console.log(`✅ WebP exists: ${webpRelativePath}`)
      return `/uploads/${webpRelativePath}`
    }

    // Download original image
    const tempOriginalPath = path.join(
      config.targetUploadsPath,
      'temp_' + path.basename(relativePath)
    )
    const downloaded = await downloadImage(wpImageUrl, tempOriginalPath)

    if (!downloaded) {
      return null
    }

    // Convert to WebP
    const converted = await convertToWebP(tempOriginalPath, webpTargetPath)
    if (converted) {
      console.log(`🔄 Converted: ${relativePath} → ${webpRelativePath}`)
      return `/uploads/${webpRelativePath}`
    } else {
      // Fallback: move original
      const originalTargetPath = path.join(config.targetUploadsPath, relativePath)
      const originalDir = path.dirname(originalTargetPath)
      if (!fs.existsSync(originalDir)) {
        fs.mkdirSync(originalDir, { recursive: true })
      }
      fs.renameSync(tempOriginalPath, originalTargetPath)
      console.log(`📋 Fallback: ${relativePath}`)
      return `/uploads/${relativePath}`
    }
  } catch (error) {
    console.warn(`❌ Process error for ${wpImageUrl}:`, error)
    return null
  }
}

/**
 * 1) WordPress Featured Images migrieren
 */
async function migrateFeaturedImages() {
  console.log('🖼️ Migriere WordPress Featured Images mit URL Download...')

  const featuredImages = (await mysql.$queryRawUnsafe(`
    SELECT
      CAST(pm.post_id as CHAR) as post_id,
      CAST(pm.meta_value as CHAR) as attachment_id,
      att.guid as image_url,
      att_meta.meta_value as image_file,
      p.post_type,
      p.post_name,
      p.post_title
    FROM ${getTableName('postmeta')} pm
    LEFT JOIN ${getTableName('posts')} att ON pm.meta_value = att.ID
    LEFT JOIN ${getTableName('postmeta')} att_meta ON att.ID = att_meta.post_id AND att_meta.meta_key = '_wp_attached_file'
    LEFT JOIN ${getTableName('posts')} p ON pm.post_id = p.ID
    WHERE pm.meta_key = '_thumbnail_id'
    AND att.post_type = 'attachment'
    AND p.post_status = 'publish'
    AND p.post_type IN ('post', 'page', 'avada_portfolio')
    AND att.guid IS NOT NULL
    ORDER BY p.post_type, p.post_name
  `)) as any[]

  console.log(`🖼️ Gefunden: ${featuredImages.length} Featured Images`)

  // Clear existing featured images
  console.log('🧹 Cleaning existing featured images...')
  await pg.$executeRaw`DELETE FROM cms_article_meta WHERE key = 'featured_image'`
  await pg.$executeRaw`DELETE FROM cms_page_meta WHERE key = 'featured_image'`
  await pg.$executeRaw`DELETE FROM cms_portfolio_meta WHERE key = 'featured_image'`

  let processedCount = 0
  let webpCount = 0
  let assignedCount = 0

  for (const img of featuredImages) {
    try {
      if (!img.image_url) continue

      console.log(`\n📸 Processing: ${img.post_title} (${img.post_type})`)

      const processedPath = await processImageUrl(img.image_url)
      if (!processedPath) {
        console.warn(`⚠️ Could not process image for ${img.post_name}`)
        continue
      }

      processedCount++
      if (processedPath.endsWith('.webp')) {
        webpCount++
      }

      // Assign to appropriate content type
      if (img.post_type === 'post') {
        const article = await pg.article.findFirst({ where: { slug: img.post_name } })
        if (article) {
          await pg.articleMeta.create({
            data: {
              articleId: article.id,
              key: 'featured_image',
              value: processedPath
            }
          })
          console.log(`✅ Article "${img.post_name}" → ${processedPath}`)
          assignedCount++
        }
      } else if (img.post_type === 'page') {
        const page = await pg.page.findFirst({ where: { slug: img.post_name } })
        if (page) {
          await pg.pageMeta.create({
            data: {
              pageId: page.id,
              key: 'featured_image',
              value: processedPath
            }
          })
          console.log(`✅ Page "${img.post_name}" → ${processedPath}`)
          assignedCount++
        }
      } else if (img.post_type === 'avada_portfolio') {
        const portfolio = await pg.portfolio.findFirst({ where: { slug: img.post_name } })
        if (portfolio) {
          await pg.portfolioMeta.create({
            data: {
              portfolioId: portfolio.id,
              key: 'featured_image',
              value: processedPath
            }
          })
          console.log(`✅ Portfolio "${img.post_name}" → ${processedPath}`)
          assignedCount++
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error processing featured image for ${img.post_name}:`, error)
    }
  }

  const webpPercentage = processedCount > 0 ? Math.round((webpCount / processedCount) * 100) : 0
  console.log(`\n📊 Featured Images Results:`)
  console.log(`   Processed: ${processedCount} images`)
  console.log(`   WebP conversions: ${webpCount} (${webpPercentage}%)`)
  console.log(`   Assigned to content: ${assignedCount}`)
}

/**
 * 2) Zusätzliche WordPress Attachments migrieren
 */
async function migrateAdditionalAttachments() {
  console.log('\n📎 Migriere zusätzliche WordPress Attachments...')

  const attachments = (await mysql.$queryRawUnsafe(`
    SELECT
      CAST(p.ID as CHAR) as ID,
      p.post_title,
      p.post_date,
      p.post_mime_type,
      p.guid,
      pm_file.meta_value as attachment_file
    FROM ${getTableName('posts')} p
    LEFT JOIN ${getTableName('postmeta')} pm_file ON p.ID = pm_file.post_id AND pm_file.meta_key = '_wp_attached_file'
    WHERE p.post_type = 'attachment'
    AND p.post_mime_type LIKE 'image/%'
    AND p.guid IS NOT NULL
    -- Exclude featured images (they're handled separately)
    AND p.ID NOT IN (
      SELECT DISTINCT pm.meta_value
      FROM ${getTableName('postmeta')} pm
      WHERE pm.meta_key = '_thumbnail_id'
    )
    ORDER BY p.post_date DESC
    LIMIT 50
  `)) as any[]

  console.log(`📄 Gefunden: ${attachments.length} zusätzliche Attachments`)

  let processedCount = 0
  let webpCount = 0

  for (const att of attachments) {
    try {
      if (!att.guid) continue

      console.log(`\n📷 Processing attachment: ${att.post_title}`)

      const processedPath = await processImageUrl(att.guid)
      if (processedPath) {
        processedCount++
        if (processedPath.endsWith('.webp')) {
          webpCount++
        }
        console.log(`✅ Attachment processed: ${att.post_title}`)
      }
    } catch (error) {
      console.warn(`⚠️ Error processing attachment ${att.ID}:`, error)
    }
  }

  const webpPercentage = processedCount > 0 ? Math.round((webpCount / processedCount) * 100) : 0
  console.log(`\n📊 Attachments Results:`)
  console.log(`   Processed: ${processedCount} images`)
  console.log(`   WebP conversions: ${webpCount} (${webpPercentage}%)`)
}

/**
 * 3) Erstelle uploads Verzeichnis
 */
async function ensureUploadsDirectory() {
  if (!fs.existsSync(config.targetUploadsPath)) {
    fs.mkdirSync(config.targetUploadsPath, { recursive: true })
    console.log(`📁 Created uploads directory: ${config.targetUploadsPath}`)
  }
}

/**
 * Main Migration Function
 */
async function main() {
  console.log('🚀 WordPress Media URL Download Migration gestartet...')
  console.log(`📂 Target: ${config.targetUploadsPath}`)
  console.log(`🌐 WordPress Base: ${config.wpBaseUrl}`)
  console.log(`🎯 WebP Quality: ${config.webpQuality}%`)

  try {
    await ensureUploadsDirectory()
    await migrateFeaturedImages()
    await migrateAdditionalAttachments()

    console.log('\n✅ WordPress Media Migration erfolgreich abgeschlossen!')
    console.log('📊 Migration Summary:')
    console.log('   ✅ Featured Images mit 100% WebP Ziel')
    console.log('   ✅ Zusätzliche Attachments verarbeitet')
    console.log('   ✅ DB-Migration-sicher implementiert')
    console.log('   ✅ URLs zu lokalen Pfaden konvertiert')
  } catch (error) {
    console.error('❌ Migration Fehler:', error)
    process.exit(1)
  } finally {
    await mysql.$disconnect()
    await pg.$disconnect()
  }
}

main().catch(console.error)
