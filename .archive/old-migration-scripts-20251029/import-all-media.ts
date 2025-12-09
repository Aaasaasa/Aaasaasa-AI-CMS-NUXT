import { promises as fs } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { Client } from 'pg'

// PostgreSQL connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'nuxt_pg_cms_db',
  user: 'usrcms',
  password: '<POSTGRES_PASSWORD>'
})

interface MediaFile {
  filename: string
  filepath: string
  stats: {
    size: number
    mtime: Date
  }
  dimensions?: {
    width: number
    height: number
  }
}

interface WordPressAttachment {
  wp_attachment_id: number
  original_filename: string
  upload_path: string
}

// Get image dimensions (mock implementation - you could use sharp or jimp)
async function getImageDimensions(
  filepath: string
): Promise<{ width: number; height: number } | null> {
  // For now, return default dimensions - you can enhance this with actual image processing
  const ext = extname(filepath).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    // Default dimensions - could be enhanced with actual image reading
    return { width: 1200, height: 800 }
  }
  return null
}

// Extract WordPress attachment ID from filename or path
function extractAttachmentId(filename: string, filepath: string): number | null {
  // Look for WordPress patterns like "image-123.webp" or in metadata
  const match = filename.match(/-(\d+)\./)
  if (match) {
    return parseInt(match[1])
  }

  // Generate a unique ID based on filepath hash for non-WordPress files
  let hash = 0
  for (let i = 0; i < filepath.length; i++) {
    const char = filepath.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) + 10000 // Ensure positive and avoid conflicts
}

// Get MIME type from extension
function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg'
  }
  return mimeMap[ext] || 'application/octet-stream'
}

// Scan uploads directory for all media files
async function scanMediaFiles(): Promise<MediaFile[]> {
  const uploadsDir = '/srv/proj/nuxt-wp-multilang-theme/public/uploads'
  const mediaFiles: MediaFile[] = []

  async function scanDirectory(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          await scanDirectory(fullPath)
        } else if (entry.isFile()) {
          // Only include media files
          const ext = extname(entry.name).toLowerCase()
          const mediaExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.webp',
            '.gif',
            '.svg',
            '.pdf',
            '.mp4',
            '.mp3'
          ]

          if (mediaExtensions.includes(ext)) {
            const stats = await fs.stat(fullPath)
            const relativePath = fullPath.replace('/srv/proj/nuxt-wp-multilang-theme/public', '')

            const dimensions = await getImageDimensions(fullPath)

            mediaFiles.push({
              filename: entry.name,
              filepath: relativePath,
              stats: {
                size: stats.size,
                mtime: stats.mtime
              },
              dimensions: dimensions || undefined
            })
          }
        }
      }
    } catch (error) {
      console.log(`Scanning directory ${dir}:`, (error as Error).message)
    }
  }

  await scanDirectory(uploadsDir)
  return mediaFiles
}

// Import WordPress attachment metadata
async function importWordPressAttachments(): Promise<Map<number, WordPressAttachment>> {
  const attachments = new Map<number, WordPressAttachment>()

  try {
    // Get WordPress _thumbnail_id references
    const thumbnailQuery = `
      SELECT
        article_id as content_id,
        'article' as content_type,
        (value->>'_thumbnail_id')::integer as wp_attachment_id
      FROM cms_article_meta
      WHERE key = '_thumbnail_id' AND value->>'_thumbnail_id' IS NOT NULL
      UNION ALL
      SELECT
        page_id as content_id,
        'page' as content_type,
        (value->>'_thumbnail_id')::integer as wp_attachment_id
      FROM cms_page_meta
      WHERE key = '_thumbnail_id' AND value->>'_thumbnail_id' IS NOT NULL
      UNION ALL
      SELECT
        portfolio_id as content_id,
        'portfolio' as content_type,
        (value->>'_thumbnail_id')::integer as wp_attachment_id
      FROM cms_portfolio_meta
      WHERE key = '_thumbnail_id' AND value->>'_thumbnail_id' IS NOT NULL
    `

    const result = await client.query(thumbnailQuery)
    console.log(`Found ${result.rows.length} WordPress attachment references`)

    for (const row of result.rows) {
      if (!attachments.has(row.wp_attachment_id)) {
        attachments.set(row.wp_attachment_id, {
          wp_attachment_id: row.wp_attachment_id,
          original_filename: `attachment-${row.wp_attachment_id}`,
          upload_path: `/uploads/attachment-${row.wp_attachment_id}`
        })
      }
    }
  } catch (error) {
    console.log('Error importing WordPress attachments:', (error as Error).message)
  }

  return attachments
}

// Import all media into cms_media table
async function importMediaToDatabase(
  mediaFiles: MediaFile[],
  wpAttachments: Map<number, WordPressAttachment>
): Promise<void> {
  console.log(`Importing ${mediaFiles.length} media files...`)

  for (const media of mediaFiles) {
    try {
      const wpAttachmentId = extractAttachmentId(media.filename, media.filepath)
      const mimeType = getMimeType(media.filename)
      const basePath = dirname(media.filepath)

      // Check if already exists
      const existsResult = await client.query(
        'SELECT id FROM cms_media WHERE file_path = $1 OR wp_attachment_id = $2',
        [media.filepath, wpAttachmentId]
      )

      if (existsResult.rows.length > 0) {
        console.log(`Skipping existing media: ${media.filename}`)
        continue
      }

      // Insert main media record
      const insertResult = await client.query(
        `
        INSERT INTO cms_media (
          wp_attachment_id, filename, original_filename, mime_type,
          file_size, file_path, base_path, width, height,
          upload_date, wp_meta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `,
        [
          wpAttachmentId,
          media.filename,
          basename(media.filename, extname(media.filename)), // Original without extension
          mimeType,
          media.stats.size,
          media.filepath,
          basePath,
          media.dimensions?.width || null,
          media.dimensions?.height || null,
          media.stats.mtime,
          JSON.stringify({
            upload_date: media.stats.mtime.toISOString(),
            file_size: media.stats.size,
            original_path: media.filepath
          })
        ]
      )

      const mediaId = insertResult.rows[0].id

      // Insert original size
      await client.query(
        `
        INSERT INTO cms_media_sizes (
          media_id, size_name, file_path, width, height, file_size
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          mediaId,
          'original',
          media.filepath,
          media.dimensions?.width || null,
          media.dimensions?.height || null,
          media.stats.size
        ]
      )

      // Look for other sizes (WordPress creates thumbnails)
      const baseNameWithoutExt = basename(media.filename, extname(media.filename))
      const directory = dirname(media.filepath)

      // Common WordPress image sizes to look for
      const commonSizes = ['thumbnail', 'medium', 'large', 'small']
      for (const size of commonSizes) {
        const sizePattern = `${baseNameWithoutExt}-${size}${extname(media.filename)}`
        const sizePath = `${directory}/${sizePattern}`

        // This would require checking if the file exists - for now just log
        console.log(`Would check for size variant: ${sizePath}`)
      }

      console.log(`✓ Imported: ${media.filename} (ID: ${mediaId})`)
    } catch (error) {
      console.error(`Error importing ${media.filename}:`, (error as Error).message)
    }
  }
}

// Main function
async function main(): Promise<void> {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL')

    // Step 1: Scan all media files
    console.log('\\n1. Scanning uploads directory...')
    const mediaFiles = await scanMediaFiles()
    console.log(`Found ${mediaFiles.length} media files`)

    // Step 2: Import WordPress attachment data
    console.log('\\n2. Importing WordPress attachment metadata...')
    const wpAttachments = await importWordPressAttachments()
    console.log(`Found ${wpAttachments.size} WordPress attachments`)

    // Step 3: Import all media to database
    console.log('\\n3. Importing media to database...')
    await importMediaToDatabase(mediaFiles, wpAttachments)

    // Step 4: Show summary
    const countResult = await client.query('SELECT COUNT(*) as count FROM cms_media')
    const sizesResult = await client.query('SELECT COUNT(*) as count FROM cms_media_sizes')

    console.log('\\n✅ Import completed!')
    console.log(`📊 Total media items: ${countResult.rows[0].count}`)
    console.log(`📊 Total size variants: ${sizesResult.rows[0].count}`)

    // Show some examples
    const examplesResult = await client.query(`
      SELECT id, filename, file_path, mime_type, file_size, wp_attachment_id
      FROM cms_media
      ORDER BY id DESC
      LIMIT 10
    `)

    console.log('\\n📝 Recent imports:')
    for (const row of examplesResult.rows) {
      console.log(`  ${row.id}: ${row.filename} (${row.mime_type}) - ${row.file_path}`)
    }
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    await client.end()
  }
}

// Run the import
main().catch(console.error)
