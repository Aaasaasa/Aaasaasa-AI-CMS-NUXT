// migrate/replace-placeholders-simple.ts
import { PrismaClient } from '../prisma/generated/postgres-cms/index.js'
import fs from 'fs'
import path from 'path'

const pg = new PrismaClient()

async function main() {
  console.log('🔍 Sammle echte WordPress-Bilder...')

  // Sammle alle .webp Bilder
  const images: string[] = []
  const uploadsPath = './public/uploads/2024'

  function scanDir(dir: string) {
    try {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const fullPath = path.join(dir, item)
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath)
        } else if (item.endsWith('.webp') && !item.startsWith('featured-')) {
          const relativePath = fullPath.replace('./public', '')
          images.push(relativePath)
        }
      }
    } catch (e) {}
  }

  scanDir(uploadsPath)
  console.log(`📷 Found ${images.length} real WordPress images`)

  if (images.length === 0) {
    console.log('❌ Keine echten Bilder gefunden')
    return
  }

  // Ersetze Platzhalter in Articles
  const articleMetas = await pg.articleMeta.findMany({
    where: { key: 'featured_image' },
    include: { article: { select: { slug: true } } }
  })

  let updated = 0
  for (const meta of articleMetas) {
    const value = meta.value?.toString()
    if (value && value.includes('featured-')) {
      const newImage = images[updated % images.length]
      await pg.articleMeta.update({
        where: { id: meta.id },
        data: { value: newImage }
      })
      console.log(`✅ Article ${meta.article.slug} → ${newImage}`)
      updated++
    }
  }

  // Ersetze Platzhalter in Pages
  const pageMetas = await pg.pageMeta.findMany({
    where: { key: 'featured_image' },
    include: { page: { select: { slug: true } } }
  })

  for (const meta of pageMetas) {
    const value = meta.value?.toString()
    if (value && value.includes('featured-')) {
      const newImage = images[updated % images.length]
      await pg.pageMeta.update({
        where: { id: meta.id },
        data: { value: newImage }
      })
      console.log(`✅ Page ${meta.page.slug} → ${newImage}`)
      updated++
    }
  }

  // Ersetze Platzhalter in Portfolios
  const portfolioMetas = await pg.portfolioMeta.findMany({
    where: { key: 'featured_image' },
    include: { portfolio: { select: { slug: true } } }
  })

  for (const meta of portfolioMetas) {
    const value = meta.value?.toString()
    if (value && value.includes('featured-')) {
      const newImage = images[updated % images.length]
      await pg.portfolioMeta.update({
        where: { id: meta.id },
        data: { value: newImage }
      })
      console.log(`✅ Portfolio ${meta.portfolio.slug} → ${newImage}`)
      updated++
    }
  }

  console.log(`\n✅ Updated ${updated} featured images with real WordPress images!`)
  await pg.$disconnect()
}

main().catch(console.error)
