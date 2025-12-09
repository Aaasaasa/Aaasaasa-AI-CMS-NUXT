/* eslint-disable no-console */
import { PrismaClient } from '../prisma/generated/postgres-cms'

const pg = new PrismaClient()

// Same stripShortcodes function from migrate.ts
function stripShortcodes(content: string): string {
  if (!content) return content

  // Remove all shortcodes: [shortcode]...[/shortcode] or [shortcode attr="value"]
  const cleaned = content
    // Remove paired shortcodes like [fusion_*]...[/fusion_*]
    .replace(/\[fusion_[^\]]*\][\s\S]*?\[\/fusion_[^\]]*\]/g, '')
    // Remove self-closing or simple shortcodes
    .replace(/\[[^\]]+\]/g, '')
    // Clean up multiple blank lines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()

  return cleaned
}

async function cleanPortfolioShortcodes() {
  console.log('🧹 Cleaning shortcodes from portfolio translations...')

  // Get all portfolio translations
  const portfolios = await pg.portfolioTranslation.findMany({
    select: { id: true, title: true, content: true, excerpt: true }
  })

  console.log(`Found ${portfolios.length} portfolio translations`)

  let updatedCount = 0
  for (const p of portfolios) {
    const hasShortcodes =
      (p.content && p.content.includes('[')) || (p.excerpt && p.excerpt.includes('['))

    if (hasShortcodes) {
      const cleanContent = stripShortcodes(p.content || '')
      const cleanExcerpt = stripShortcodes(p.excerpt || '')

      await pg.portfolioTranslation.update({
        where: { id: p.id },
        data: {
          content: cleanContent,
          excerpt: cleanExcerpt
        }
      })

      console.log(`  ✓ Cleaned: ${p.title}`)
      updatedCount++
    }
  }

  console.log(`\n✅ Updated ${updatedCount} portfolio translations`)

  // Verify
  const remaining = await pg.portfolioTranslation.findMany({
    where: {
      OR: [{ content: { contains: '[' } }, { excerpt: { contains: '[' } }]
    }
  })

  console.log(`Remaining items with brackets: ${remaining.length}`)
}

cleanPortfolioShortcodes()
  .catch(console.error)
  .finally(async () => {
    await pg.$disconnect()
  })
