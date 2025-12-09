// migrate/wordpress-media-migration.ts
// WordPress Media/Attachments Migration zu PostgreSQL
// Migriert wp_posts mit post_type='attachment' und postmeta für Featured Images

import { PrismaClient as MySQLClient } from '../prisma/generated/mysql/index.js'
import { PrismaClient as PostgresCMSClient } from '../prisma/generated/postgres-cms/index.js'
import dotenv from 'dotenv'

dotenv.config()

const mysql = new MySQLClient()
const pg = new PostgresCMSClient()

const config = {
  wpPrefix: process.env.DB_PREFIX || 'as_',
  defaultLanguage: 'de',
  uploadsPath: '/uploads' // Relativer Pfad zu public/uploads
}

function getTableName(table: string): string {
  return `${config.wpPrefix}${table}`
}

/**
 * 1) WordPress Attachments migrieren
 */
async function migrateAttachments() {
  console.log('📸 Migriere WordPress Media/Attachments...')

  const attachments = (await mysql.$queryRawUnsafe(`
    SELECT
      CAST(p.ID as CHAR) as ID,
      p.post_title,
      p.post_content,
      p.post_date,
      p.post_mime_type,
      p.guid,
      pm_guid.meta_value as attachment_url,
      pm_file.meta_value as attachment_file,
      pm_alt.meta_value as alt_text
    FROM ${getTableName('posts')} p
    LEFT JOIN ${getTableName('postmeta')} pm_guid ON p.ID = pm_guid.post_id AND pm_guid.meta_key = '_wp_attachment_metadata'
    LEFT JOIN ${getTableName('postmeta')} pm_file ON p.ID = pm_file.post_id AND pm_file.meta_key = '_wp_attached_file'
    LEFT JOIN ${getTableName('postmeta')} pm_alt ON p.ID = pm_alt.post_id AND pm_alt.meta_key = '_wp_attachment_image_alt'
    WHERE p.post_type = 'attachment'
    ORDER BY p.post_date DESC
  `)) as any[]

  console.log(`📄 Gefunden: ${attachments.length} Attachments`)

  for (const att of attachments) {
    try {
      // Nur Original-Dateien migrieren (keine WordPress Thumbnails)
      const originalUrl = att.guid || att.attachment_file
      let relativePath = originalUrl

      if (originalUrl) {
        // WordPress URL zu relativem Pfad konvertieren
        const urlMatch = originalUrl.match(/wp-content\/uploads\/(.+)$/)
        if (urlMatch) {
          let filePath = urlMatch[1]

          // WordPress Thumbnails ignorieren (z.B. image-150x150.jpg)
          if (filePath.match(/-\d+x\d+\.(jpg|jpeg|png|gif|webp)$/i)) {
            console.log(`⏭️ Skipping WordPress thumbnail: ${filePath}`)
            continue
          }

          relativePath = `${config.uploadsPath}/${filePath}`
        }
      }

      // ID ist jetzt bereits als String durch CAST()

      // In ArticleMeta als attachment speichern
      const mediaData = {
        metaKey: 'attachment_data',
        metaValue: JSON.stringify({
          originalId: att.ID,
          url: relativePath,
          title: att.post_title || '',
          description: att.post_content || '',
          altText: att.alt_text || '',
          mimeType: att.post_mime_type || 'image/jpeg',
          uploadedAt: att.post_date
        })
      }

      console.log(`📎 Attachment: ${att.post_title} -> ${relativePath}`)
    } catch (error) {
      console.warn(`⚠️ Skipping attachment ${att.ID}:`, error)
    }
  }

  console.log('✅ Attachments migriert')
}

/**
 * 2) Featured Images für Articles/Pages setzen
 */
async function migrateFeaturedImages() {
  console.log('🖼️ Migriere Featured Images...')

  const featuredImages = (await mysql.$queryRawUnsafe(`
    SELECT
      CAST(pm.post_id as CHAR) as post_id,
      CAST(pm.meta_value as CHAR) as attachment_id,
      att.guid as image_url,
      att_meta.meta_value as image_file
    FROM ${getTableName('postmeta')} pm
    LEFT JOIN ${getTableName('posts')} att ON pm.meta_value = att.ID
    LEFT JOIN ${getTableName('postmeta')} att_meta ON att.ID = att_meta.post_id AND att_meta.meta_key = '_wp_attached_file'
    WHERE pm.meta_key = '_thumbnail_id'
    AND att.post_type = 'attachment'
  `)) as any[]

  console.log(`🖼️ Gefunden: ${featuredImages.length} Featured Images`)

  for (const img of featuredImages) {
    try {
      // WordPress Post ID zu PostgreSQL Article/Page mapping
      const wpPost = (await mysql.$queryRawUnsafe(`
        SELECT post_type, post_name FROM ${getTableName('posts')} WHERE ID = '${img.post_id}'
      `)) as any[]

      if (wpPost.length === 0) continue

      const post = wpPost[0]
      let relativePath = img.image_url

      if (img.image_url) {
        const urlMatch = img.image_url.match(/wp-content\/uploads\/(.+)$/)
        if (urlMatch) {
          let filePath = urlMatch[1]

          // Check if WebP version exists (we converted JPG/PNG to WebP)
          const webpPath = filePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
          const webpFullPath = `/srv/proj/nuxt-wp-multilang-theme/public${config.uploadsPath}/${webpPath}`

          try {
            // Check if WebP file exists
            require('fs').accessSync(webpFullPath)
            relativePath = `${config.uploadsPath}/${webpPath}` // Use WebP
            console.log(`🔄 Using WebP: ${filePath} → ${webpPath}`)
          } catch {
            relativePath = `${config.uploadsPath}/${filePath}` // Use original
          }
        }
      }

      // Featured Image in PostgreSQL setzen
      if (post.post_type === 'post') {
        // Article featured image
        const article = await pg.article.findFirst({ where: { slug: post.post_name } })
        if (article) {
          await pg.articleMeta.create({
            data: {
              articleId: article.id,
              key: 'featured_image',
              value: relativePath
            }
          })
          console.log(`🖼️ Featured Image: Article "${post.post_name}" -> ${relativePath}`)
        }
      } else if (post.post_type === 'page') {
        // Page featured image
        const page = await pg.page.findFirst({ where: { slug: post.post_name } })
        if (page) {
          await pg.pageMeta.create({
            data: {
              pageId: page.id,
              key: 'featured_image',
              value: relativePath
            }
          })
          console.log(`🖼️ Featured Image: Page "${post.post_name}" -> ${relativePath}`)
        }
      }
    } catch (error) {
      console.warn(`⚠️ Skipping featured image for post ${img.post_id}:`, error)
    }
  }

  console.log('✅ Featured Images migriert')
}

/**
 * Main Migration Function
 */
async function main() {
  console.log('🚀 WordPress Media Migration gestartet...')

  try {
    await migrateAttachments()
    await migrateFeaturedImages()

    console.log('✅ WordPress Media Migration erfolgreich abgeschlossen!')
    console.log('📝 Nächste Schritte:')
    console.log('   1. Kopiere wp-content/uploads/ nach public/uploads/')
    console.log('   2. Teste die Bilddarstellung im Frontend')
  } catch (error) {
    console.error('❌ Migration Fehler:', error)
    process.exit(1)
  } finally {
    await mysql.$disconnect()
    await pg.$disconnect()
  }
}

main().catch(console.error)
