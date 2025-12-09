import { Client } from 'pg'

// PostgreSQL connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'nuxt_pg_cms_db',
  user: 'usrcms',
  password: '<POSTGRES_PASSWORD>'
})

interface ContentMeta {
  content_type: 'article' | 'page' | 'portfolio'
  content_id: number
  wp_attachment_id: number | null
  current_featured_image: string | null
}

// Update featured images to use media_id instead of direct paths
async function updateFeaturedImagesToMediaIds(): Promise<void> {
  console.log('🔄 Updating featured images to use media_id references...')

  try {
    // Step 1: Get all current featured images with their WordPress attachment IDs
    const currentFeaturedQuery = `
      -- Articles with featured images
      SELECT
        'article' as content_type,
        a.id as content_id,
        COALESCE((am_thumbnail.value->>'_thumbnail_id')::integer, null) as wp_attachment_id,
        am_featured.value::text as current_featured_image
      FROM cms_articles a
      LEFT JOIN cms_article_meta am_thumbnail ON am_thumbnail."articleId" = a.id AND am_thumbnail.key = '_thumbnail_id'
      LEFT JOIN cms_article_meta am_featured ON am_featured."articleId" = a.id AND am_featured.key = 'featured_image'
      WHERE am_featured.value::text IS NOT NULL

      UNION ALL

      -- Pages with featured images
      SELECT
        'page' as content_type,
        p.id as content_id,
        COALESCE((pm_thumbnail.value->>'_thumbnail_id')::integer, null) as wp_attachment_id,
        pm_featured.value::text as current_featured_image
      FROM cms_pages p
      LEFT JOIN cms_page_meta pm_thumbnail ON pm_thumbnail."pageId" = p.id AND pm_thumbnail.key = '_thumbnail_id'
      LEFT JOIN cms_page_meta pm_featured ON pm_featured."pageId" = p.id AND pm_featured.key = 'featured_image'
      WHERE pm_featured.value::text IS NOT NULL

      UNION ALL

      -- Portfolios with featured images
      SELECT
        'portfolio' as content_type,
        p.id as content_id,
        COALESCE((pm_thumbnail.value->>'_thumbnail_id')::integer, null) as wp_attachment_id,
        pm_featured.value::text as current_featured_image
      FROM cms_portfolios p
      LEFT JOIN cms_portfolio_meta pm_thumbnail ON pm_thumbnail."portfolioId" = p.id AND pm_thumbnail.key = '_thumbnail_id'
      LEFT JOIN cms_portfolio_meta pm_featured ON pm_featured."portfolioId" = p.id AND pm_featured.key = 'featured_image'
      WHERE pm_featured.value::text IS NOT NULL
    `

    const result = await client.query(currentFeaturedQuery)
    const contentItems: ContentMeta[] = result.rows

    console.log(`Found ${contentItems.length} content items with featured images`)

    let updated = 0
    let failed = 0

    for (const item of contentItems) {
      try {
        let mediaId: number | null = null

        // Step 2: Find corresponding media record
        if (item.wpAttachmentId) {
          // Try to find by WordPress attachment ID first
          const mediaByAttachment = await client.query(
            'SELECT id FROM cms_media WHERE wp_attachment_id = $1 ORDER BY id LIMIT 1',
            [item.wpAttachmentId]
          )

          if (mediaByAttachment.rows.length > 0) {
            mediaId = mediaByAttachment.rows[0].id
            console.log(
              `✓ Found media by attachment ID ${item.wpAttachmentId} -> media_id ${mediaId}`
            )
          }
        }

        // If not found by attachment ID, try to find by file path
        if (!mediaId && item.currentFeaturedImage) {
          // Clean the path - remove JSON quotes if present
          let cleanPath = item.currentFeaturedImage
          if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
            cleanPath = cleanPath.slice(1, -1)
          }

          const mediaByPath = await client.query(
            'SELECT id FROM cms_media WHERE file_path = $1 ORDER BY id LIMIT 1',
            [cleanPath]
          )

          if (mediaByPath.rows.length > 0) {
            mediaId = mediaByPath.rows[0].id
            console.log(`✓ Found media by path ${cleanPath} -> media_id ${mediaId}`)
          }
        }

        // If still not found, try partial path matching (for cases where path might differ slightly)
        if (!mediaId && item.currentFeaturedImage) {
          let cleanPath = item.currentFeaturedImage
          if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
            cleanPath = cleanPath.slice(1, -1)
          }

          const filename = cleanPath.split('/').pop()
          if (filename) {
            const mediaByFilename = await client.query(
              'SELECT id FROM cms_media WHERE filename = $1 OR file_path LIKE $2 ORDER BY id LIMIT 1',
              [filename, `%${filename}%`]
            )

            if (mediaByFilename.rows.length > 0) {
              mediaId = mediaByFilename.rows[0].id
              console.log(`✓ Found media by filename ${filename} -> media_id ${mediaId}`)
            }
          }
        } // Step 3: Update the meta record with media_id
        if (mediaId) {
          const metaUpdate = {
            media_id: mediaId,
            featured_image: item.currentFeaturedImage, // Keep the path for backward compatibility
            updated_at: new Date().toISOString()
          }

          // Update the appropriate meta table
          let updateQuery = ''
          let updateParams: any[] = []

          if (item.contentType === 'article') {
            updateQuery = `
              UPDATE cms_article_meta
              SET value = $1
              WHERE "articleId" = $2 AND key = 'featured_image'
            `
            updateParams = [JSON.stringify(metaUpdate), item.contentId]
          } else if (item.contentType === 'page') {
            updateQuery = `
              UPDATE cms_page_meta
              SET value = $1
              WHERE "pageId" = $2 AND key = 'featured_image'
            `
            updateParams = [JSON.stringify(metaUpdate), item.contentId]
          } else if (item.contentType === 'portfolio') {
            updateQuery = `
              UPDATE cms_portfolio_meta
              SET value = $1
              WHERE "portfolioId" = $2 AND key = 'featured_image'
            `
            updateParams = [JSON.stringify(metaUpdate), item.contentId]
          }

          await client.query(updateQuery, updateParams)
          updated++
          console.log(`✅ Updated ${item.contentType} ${item.contentId} -> media_id ${mediaId}`)
        } else {
          console.warn(
            `⚠️  No media found for ${item.contentType} ${item.contentId} (${item.currentFeaturedImage})`
          )
          failed++
        }
      } catch (error) {
        console.error(
          `❌ Error updating ${item.contentType} ${item.contentId}:`,
          (error as Error).message
        )
        failed++
      }
    }

    console.log(`\\n📊 Update Summary:`)
    console.log(`   ✅ Successfully updated: ${updated}`)
    console.log(`   ❌ Failed updates: ${failed}`)
    console.log(`   📝 Total processed: ${contentItems.length}`)
  } catch (error) {
    console.error('❌ Error updating featured images:', (error as Error).message)
  }
}

// Add featured_media_id columns to meta tables for better performance (optional)
async function addMediaIdColumns(): Promise<void> {
  console.log('\\n🔄 Adding media_id columns to meta tables...')

  try {
    // Add media_id columns to meta tables
    const alterQueries = [
      'ALTER TABLE cms_article_meta ADD COLUMN IF NOT EXISTS media_id INTEGER REFERENCES cms_media(id) ON DELETE SET NULL',
      'ALTER TABLE cms_page_meta ADD COLUMN IF NOT EXISTS media_id INTEGER REFERENCES cms_media(id) ON DELETE SET NULL',
      'ALTER TABLE cms_portfolio_meta ADD COLUMN IF NOT EXISTS media_id INTEGER REFERENCES cms_media(id) ON DELETE SET NULL'
    ]

    for (const query of alterQueries) {
      await client.query(query)
    }

    // Create indexes for performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_article_meta_media_id ON cms_article_meta(media_id) WHERE media_id IS NOT NULL',
      'CREATE INDEX IF NOT EXISTS idx_page_meta_media_id ON cms_page_meta(media_id) WHERE media_id IS NOT NULL',
      'CREATE INDEX IF NOT EXISTS idx_portfolio_meta_media_id ON cms_portfolio_meta(media_id) WHERE media_id IS NOT NULL'
    ]

    for (const query of indexQueries) {
      await client.query(query)
    }

    console.log('✅ Media ID columns and indexes added successfully')
  } catch (error) {
    console.error('❌ Error adding media_id columns:', (error as Error).message)
  }
}

// Update existing records to use the new media_id column
async function updateMediaIdColumns(): Promise<void> {
  console.log('\\n🔄 Updating media_id columns with values from JSON...')

  try {
    const updateQueries = [
      `UPDATE cms_article_meta
       SET media_id = (value->>'media_id')::integer
       WHERE key = 'featured_image' AND value->>'media_id' IS NOT NULL`,

      `UPDATE cms_page_meta
       SET media_id = (value->>'media_id')::integer
       WHERE key = 'featured_image' AND value->>'media_id' IS NOT NULL`,

      `UPDATE cms_portfolio_meta
       SET media_id = (value->>'media_id')::integer
       WHERE key = 'featured_image' AND value->>'media_id' IS NOT NULL`
    ]

    let totalUpdated = 0

    for (const query of updateQueries) {
      const result = await client.query(query)
      totalUpdated += result.rowCount || 0
    }

    console.log(`✅ Updated ${totalUpdated} meta records with media_id references`)
  } catch (error) {
    console.error('❌ Error updating media_id columns:', (error as Error).message)
  }
}

// Main function
async function main(): Promise<void> {
  try {
    await client.connect()
    console.log('🔗 Connected to PostgreSQL')

    console.log('\\n🎯 Starting Featured Images System Upgrade...')

    // Step 1: Add media_id columns
    await addMediaIdColumns()

    // Step 2: Update featured images to reference media table
    await updateFeaturedImagesToMediaIds()

    // Step 3: Update the new media_id columns
    await updateMediaIdColumns()

    // Step 4: Show final summary
    const summaryQuery = `
      SELECT
        'Articles' as content_type,
        COUNT(*) as total_with_featured_images,
        COUNT(media_id) as total_with_media_id
      FROM cms_article_meta
      WHERE key = 'featured_image'

      UNION ALL

      SELECT
        'Pages' as content_type,
        COUNT(*) as total_with_featured_images,
        COUNT(media_id) as total_with_media_id
      FROM cms_page_meta
      WHERE key = 'featured_image'

      UNION ALL

      SELECT
        'Portfolios' as content_type,
        COUNT(*) as total_with_featured_images,
        COUNT(media_id) as total_with_media_id
      FROM cms_portfolio_meta
      WHERE key = 'featured_image'
    `

    const summaryResult = await client.query(summaryQuery)

    console.log('\\n📊 Final Summary:')
    for (const row of summaryResult.rows) {
      console.log(
        `   ${row.content_type}: ${row.total_with_media_id}/${row.total_with_featured_images} linked to media table`
      )
    }

    console.log('\\n🎉 Featured Images System upgrade completed!')
    console.log('\\n💡 Benefits:')
    console.log('   ✅ Robust media management via cms_media table')
    console.log('   ✅ Automatic size variants support')
    console.log('   ✅ Better performance with proper indexes')
    console.log('   ✅ Backward compatibility maintained')
    console.log('   ✅ Eliminates duplicate/missing images issues')
  } catch (error) {
    console.error('❌ Upgrade failed:', (error as Error).message)
  } finally {
    await client.end()
  }
}

// Run the upgrade
main().catch(console.error)
