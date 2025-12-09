// scripts/import-avada-portfolios.ts
// Import Avada Theme Portfolio items from WordPress to PostgreSQL
/* eslint-disable no-console */
import { PrismaClient as PrismaCMS } from '../prisma/generated/postgres-cms'
import { PrismaClient as PrismaMySQL } from '../prisma/generated/mysql'

const pg = new PrismaCMS()
const mysql = new PrismaMySQL()

async function importAvadaPortfolios() {
  console.log('🎨 Importing Avada Portfolio items...')

  // Get portfolios from WordPress
  const portfolios = await mysql.as_posts.findMany({
    where: {
      post_type: 'avada_portfolio',
      post_status: 'publish'
    }
  })

  console.log(`Found ${portfolios.length} portfolio items in WordPress`)

  // Get first user as default author
  const defaultAuthor = await pg.user.findFirst()
  if (!defaultAuthor) {
    throw new Error('No users found in database! Cannot import portfolios.')
  }
  console.log(`Using author: ${defaultAuthor.login} (ID: ${defaultAuthor.id})`)

  for (const p of portfolios) {
    try {
      // Create portfolio (ohne wpPostId - existiert nicht im Schema)
      const portfolio = await pg.portfolio.create({
        data: {
          slug: p.post_name || `portfolio-${p.ID}`,
          status: 'PUBLISHED',
          authorId: defaultAuthor.id
        }
      })

      console.log(`  Created portfolio: ${p.post_title} (ID: ${portfolio.id})`)

      // Create German translation
      await pg.portfolioTranslation.create({
        data: {
          portfolioId: portfolio.id,
          lang: 'de',
          title: p.post_title || '',
          content: p.post_content || '',
          excerpt: p.post_excerpt || ''
        }
      })

      console.log('    ✓ Added translation')

      // Get featured image from WordPress postmeta
      const featuredMeta = await mysql.as_postmeta.findFirst({
        where: {
          post_id: p.ID,
          meta_key: '_thumbnail_id'
        }
      })

      if (featuredMeta?.meta_value) {
        // Find media in PostgreSQL by wpAttachmentId
        const media = await pg.media.findFirst({
          where: { wpAttachmentId: Number(featuredMeta.meta_value) }
        })

        if (media) {
          // Create PortfolioMeta with featured image
          await pg.portfolioMeta.create({
            data: {
              portfolioId: portfolio.id,
              key: 'featured_image',
              value: { id: media.id },
              mediaId: media.id
            }
          })
          console.log(`    ✓ Linked featured image: ${media.filename}`)
        } else {
          console.log(`    ⚠ Featured image not found (WP ID: ${featuredMeta.meta_value})`)
        }
      }

      console.log(`  ✓ Imported: ${p.post_title}`)
    } catch (error) {
      console.error(`  ✗ Failed: ${p.post_title}`, error)
    }
  }

  console.log('✅ Avada Portfolio import completed!')

  // Show results
  const count = await pg.portfolio.count()
  console.log(`\n📊 Total portfolios in database: ${count}`)
}

importAvadaPortfolios()
  .catch(console.error)
  .finally(async () => {
    await pg.$disconnect()
    await mysql.$disconnect()
  })
