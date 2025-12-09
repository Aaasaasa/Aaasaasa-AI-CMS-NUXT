import { PrismaClient as MySqlClient } from '../prisma/generated/mysql/index.js'
import { PrismaClient as PgCMSClient } from '../prisma/generated/postgres-cms/index.js'

import dotenv from 'dotenv'
dotenv.config()

const mysql = new MySqlClient()
const pg = new PgCMSClient()

function toInt(v: any): number {
  return v ? Number(v) : 0
}

function mapStatus(status: string) {
  switch (status) {
    case 'publish':
      return 'PUBLISHED'
    case 'draft':
      return 'DRAFT'
    case 'pending':
      return 'PENDING'
    case 'trash':
      return 'TRASH'
    default:
      return 'ARCHIVED'
  }
}

/**
 * Remove WordPress shortcodes from content
 * Handles both self-closing [shortcode/] and opening/closing [shortcode]...[/shortcode]
 */
function stripShortcodes(content: string): string {
  if (!content) return ''

  // Remove fusion builder shortcodes and other common WP shortcodes
  let cleaned = content

  // Remove all shortcodes: [shortcode attributes]...[/shortcode] or [shortcode/]
  cleaned = cleaned.replace(/\[fusion_[^\]]+\]/g, '') // Remove fusion builder opening tags
  cleaned = cleaned.replace(/\[\/fusion_[^\]]+\]/g, '') // Remove fusion builder closing tags
  cleaned = cleaned.replace(/\[[^\]]+\]/g, '') // Remove any remaining shortcodes

  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n') // Max 2 newlines
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * Vrati WP post_type za dati post ID (za mapiranje comments/terms)
 */
async function getWpPostTypeById(id: number): Promise<string | null> {
  const p = await mysql.as_posts.findUnique({ where: { ID: BigInt(id) } })
  return p?.post_type ?? null
}

/**
 * 1) OČISTI SVE CMS TABELE PRIJE NOVE MIGRACIJE
 */
async function clearCMS() {
  console.log('🧹 Cleaning existing CMS tables...')

  // Truncate only tables that exist - use DELETE instead of TRUNCATE
  // to avoid FK errors
  console.log('  Deleting content relations...')
  await pg.termRelationship.deleteMany()
  await pg.commentMeta.deleteMany()
  await pg.comment.deleteMany()
  await pg.termTaxonomy.deleteMany()
  await pg.term.deleteMany()

  console.log('  Deleting media...')
  await pg.mediaSize.deleteMany()
  await pg.media.deleteMany()

  console.log('  Deleting content metadata...')
  await pg.articleMeta.deleteMany()
  await pg.pageMeta.deleteMany()
  await pg.portfolioMeta.deleteMany()
  await pg.productMeta.deleteMany()

  console.log('  Deleting content translations...')
  await pg.articleTranslation.deleteMany()
  await pg.pageTranslation.deleteMany()
  await pg.portfolioTranslation.deleteMany()
  await pg.productTranslation.deleteMany()

  console.log('  Deleting content...')
  await pg.article.deleteMany()
  await pg.page.deleteMany()
  await pg.portfolio.deleteMany()
  await pg.product.deleteMany()

  console.log('  Deleting users...')
  await pg.userMeta.deleteMany()
  await pg.employeeRole.deleteMany()
  await pg.employee.deleteMany()
  await pg.user.deleteMany()

  console.log('  Deleting menus...')
  await pg.menuItem.deleteMany()
  await pg.menu.deleteMany()

  console.log('  Deleting settings...')
  await pg.setting.deleteMany()

  console.log('  ✅ All CMS tables cleaned')
}

/**
 * 2) USERS + USER META
 */
// Store WordPress ID → PostgreSQL ID mapping
const userIdMap = new Map<number, number>()

async function migrateUsers() {
  console.log('👥 Migrating users...')

  const wpUsers = await mysql.as_users.findMany()

  for (const u of wpUsers) {
    const user = await pg.user.upsert({
      where: { email: u.user_email || `user-${String(u.ID)}@example.local` },
      update: {
        login: u.user_login,
        password: u.user_pass,
        displayName: u.display_name,
        registeredAt: u.user_registered,
        isActive: u.user_status === 0
      },
      create: {
        login: u.user_login,
        email: u.user_email || `user-${String(u.ID)}@example.local`,
        password: u.user_pass,
        displayName: u.display_name,
        registeredAt: u.user_registered,
        isActive: u.user_status === 0
      }
    })

    // Store the mapping: WordPress ID → PostgreSQL ID
    userIdMap.set(Number(u.ID), user.id)

    const metas = await mysql.as_usermeta.findMany({ where: { user_id: u.ID } })
    if (metas.length) {
      await pg.userMeta.createMany({
        data: metas.map((m) => ({
          userId: user.id,
          key: m.meta_key || '',
          value: m.meta_value ? { raw: m.meta_value } : {}
        })),
        skipDuplicates: true
      })
    }
  }
}

/**
 * 3) PAGES, ARTICLES, PORTFOLIOS (+ translations + meta)
 */
// Sanitize invalid MySQL dates (0000-00-00) from WordPress
function sanitizeDate(date: Date | null | undefined): Date {
  if (!date) return new Date()
  const d = new Date(date)
  // Check if date is invalid or before Unix epoch
  if (isNaN(d.getTime()) || d.getFullYear() < 1970) {
    return new Date()
  }
  return d
}

// Content ID mapping for menu items (WordPress ID → PostgreSQL ID)
const pageIdMap = new Map<number, number>()
const articleIdMap = new Map<number, number>()
const portfolioIdMap = new Map<number, number>()

async function migrateContent() {
  console.log('📝 Migrating pages, articles, portfolios...')

  // Use raw query with IF() to replace invalid MySQL dates (0000-00-00) with NOW()
  // Skip auto-drafts and trash items
  const wpPosts: any[] = await mysql.$queryRaw`
    SELECT
      ID, post_author,
      IF(post_date < '1970-01-01', NOW(), post_date) as post_date,
      post_content, post_title, post_excerpt,
      post_status, post_name,
      IF(post_modified < '1970-01-01', NOW(), post_modified) as post_modified,
      post_type, menu_order, post_parent
    FROM as_posts
    WHERE post_type IN ('page', 'post', 'portfolio')
      AND post_status NOT IN ('auto-draft', 'trash', 'inherit')
      AND (post_name IS NOT NULL AND post_name != '')
  `

  for (const p of wpPosts) {
    // Map WordPress author ID to PostgreSQL user ID
    const wpAuthorId = toInt(p.post_author) || 1
    const pgAuthorId = userIdMap.get(wpAuthorId) || userIdMap.values().next().value || 1

    const base = {
      slug: p.post_name || `post-${String(p.ID)}`,
      status: mapStatus(p.post_status),
      authorId: pgAuthorId,
      createdAt: sanitizeDate(p.post_date),
      updatedAt: sanitizeDate(p.post_modified)
    }

    const metas = await mysql.as_postmeta.findMany({ where: { post_id: p.ID } })

    if (p.post_type === 'page') {
      const page = await pg.page.upsert({
        where: { slug: base.slug },
        update: {
          status: base.status,
          authorId: base.authorId,
          menuOrder: p.menu_order ?? 0,
          updatedAt: base.updatedAt
        },
        create: {
          ...base,
          menuOrder: p.menu_order ?? 0
        }
      })

      // Store WordPress ID → PostgreSQL ID mapping for menu items
      pageIdMap.set(Number(p.ID), page.id)

      // WordPress content is in German (de), not English
      await pg.pageTranslation.upsert({
        where: { pageId_lang: { pageId: page.id, lang: 'de' } },
        update: {
          title: p.post_title || '',
          content: stripShortcodes(p.post_content || ''),
          excerpt: stripShortcodes(p.post_excerpt || '')
        },
        create: {
          pageId: page.id,
          lang: 'de',
          title: p.post_title || '',
          content: stripShortcodes(p.post_content || ''),
          excerpt: stripShortcodes(p.post_excerpt || '')
        }
      })

      if (metas.length) {
        await pg.pageMeta.createMany({
          data: metas.map((m) => ({
            pageId: page.id,
            key: m.meta_key || '',
            value: m.meta_value ? { raw: m.meta_value } : {}
          })),
          skipDuplicates: true
        })
      }
    }

    if (p.post_type === 'post') {
      const article = await pg.article.upsert({
        where: { slug: base.slug },
        update: {
          status: base.status,
          authorId: base.authorId,
          updatedAt: base.updatedAt
        },
        create: base
      })

      // Store WordPress ID → PostgreSQL ID mapping for menu items
      articleIdMap.set(Number(p.ID), article.id)

      // WordPress content is in German (de), not English
      await pg.articleTranslation.upsert({
        where: { articleId_lang: { articleId: article.id, lang: 'de' } },
        update: {
          title: p.post_title || '',
          content: stripShortcodes(p.post_content || ''),
          excerpt: stripShortcodes(p.post_excerpt || '')
        },
        create: {
          articleId: article.id,
          lang: 'de',
          title: p.post_title || '',
          content: stripShortcodes(p.post_content || ''),
          excerpt: stripShortcodes(p.post_excerpt || '')
        }
      })

      if (metas.length) {
        await pg.articleMeta.createMany({
          data: metas.map((m) => ({
            articleId: article.id,
            key: m.meta_key || '',
            value: m.meta_value ? { raw: m.meta_value } : {}
          })),
          skipDuplicates: true
        })
      }
    }

    if (p.post_type === 'portfolio') {
      const portfolio = await pg.portfolio.upsert({
        where: { slug: base.slug },
        update: {
          status: base.status,
          authorId: base.authorId,
          updatedAt: base.updatedAt
        },
        create: base
      })

      // Store WordPress ID → PostgreSQL ID mapping for menu items
      portfolioIdMap.set(Number(p.ID), portfolio.id)

      // WordPress content is in German (de), not English
      await pg.portfolioTranslation.upsert({
        where: {
          portfolioId_lang: { portfolioId: portfolio.id, lang: 'de' }
        },
        update: {
          title: p.post_title || '',
          content: stripShortcodes(p.post_content || ''),
          excerpt: stripShortcodes(p.post_excerpt || '')
        },
        create: {
          portfolioId: portfolio.id,
          lang: 'de',
          title: p.post_title || '',
          content: stripShortcodes(p.post_content || ''),
          excerpt: stripShortcodes(p.post_excerpt || '')
        }
      })

      if (metas.length) {
        await pg.portfolioMeta.createMany({
          data: metas.map((m) => ({
            portfolioId: portfolio.id,
            key: m.meta_key || '',
            value: m.meta_value ? { raw: m.meta_value } : {}
          })),
          skipDuplicates: true
        })
      }
    }
  }
}

/**
 * 4) PRODUCTS (+ translations + meta) — samo ako u WP postoje post_type=product
 */
async function migrateProducts() {
  console.log('🛒 Migrating products...')

  const wpProducts = await mysql.as_posts.findMany({
    where: { post_type: 'product' }
  })

  for (const p of wpProducts) {
    const product = await pg.product.upsert({
      where: { slug: p.post_name || `product-${String(p.ID)}` },
      update: {
        price: 0, // ako imaš cijenu u metama, možeš mapirati
        vendorId: toInt(p.post_author) || 1,
        updatedAt: p.post_modified
      },
      create: {
        slug: p.post_name || `product-${String(p.ID)}`,
        price: 0,
        vendorId: toInt(p.post_author) || 1,
        createdAt: p.post_date,
        updatedAt: p.post_modified
      }
    })

    await pg.productTranslation.upsert({
      where: { productId_lang: { productId: product.id, lang: 'en' } },
      update: {
        title: p.post_title || '',
        description: p.post_content || ''
      },
      create: {
        productId: product.id,
        lang: 'en',
        title: p.post_title || '',
        description: p.post_content || ''
      }
    })

    const metas = await mysql.as_postmeta.findMany({ where: { post_id: p.ID } })
    if (metas.length) {
      await pg.productMeta.createMany({
        data: metas.map((m) => ({
          productId: product.id,
          key: m.meta_key || '',
          value: m.meta_value ? { raw: m.meta_value } : {}
        })),
        skipDuplicates: true
      })
    }
  }
}

/**
 * 5) COMMENTS (+ meta) — uz mapiranje ka točnoj target tablici po WP post_type
 */
async function migrateComments() {
  console.log('💬 Migrating comments...')

  const wpComments = await mysql.as_comments.findMany()

  for (const c of wpComments) {
    const targetPostId = toInt(c.comment_post_ID)
    const postType = await getWpPostTypeById(targetPostId)

    const baseComment = {
      userId: toInt(c.user_id) || null,
      content: c.comment_content || '',
      status: c.comment_approved === '1' ? 'approved' : 'pending',
      createdAt: c.comment_date,
      updatedAt: c.comment_date_gmt
    }

    let created
    if (postType === 'page') {
      // pageId — nažalost nemamo mapu WP→PG ID koristimo slug upisane u migrateContent
      const wpPage = await mysql.as_posts.findUnique({ where: { ID: BigInt(targetPostId) } })
      const pgPage = wpPage
        ? await pg.page.findUnique({
            where: { slug: wpPage.post_name || `post-${String(wpPage.ID)}` }
          })
        : null

      created = await pg.comment.create({
        data: {
          ...baseComment,
          pageId: pgPage ? pgPage.id : null
        }
      })
    } else if (postType === 'post') {
      const wpArt = await mysql.as_posts.findUnique({ where: { ID: BigInt(targetPostId) } })
      const pgArt = wpArt
        ? await pg.article.findUnique({
            where: { slug: wpArt.post_name || `post-${String(wpArt.ID)}` }
          })
        : null

      created = await pg.comment.create({
        data: {
          ...baseComment,
          articleId: pgArt ? pgArt.id : null
        }
      })
    } else if (postType === 'portfolio') {
      const wpPort = await mysql.as_posts.findUnique({ where: { ID: BigInt(targetPostId) } })
      const pgPort = wpPort
        ? await pg.portfolio.findUnique({
            where: { slug: wpPort.post_name || `post-${String(wpPort.ID)}` }
          })
        : null

      created = await pg.comment.create({
        data: {
          ...baseComment,
          portfolioId: pgPort ? pgPort.id : null
        }
      })
    } else if (postType === 'product') {
      const wpProd = await mysql.as_posts.findUnique({ where: { ID: BigInt(targetPostId) } })
      const pgProd = wpProd
        ? await pg.product.findUnique({
            where: { slug: wpProd.post_name || `product-${String(wpProd.ID)}` }
          })
        : null

      created = await pg.comment.create({
        data: {
          ...baseComment,
          productId: pgProd ? pgProd.id : null
        }
      })
    } else {
      // Ako je nešto drugo, kreiraj “orphanned” komentar bez veze
      created = await pg.comment.create({ data: baseComment })
    }

    // commentmeta
    const metas = await mysql.as_commentmeta.findMany({ where: { comment_id: c.comment_ID } })
    if (metas.length) {
      await pg.commentMeta.createMany({
        data: metas.map((m) => ({
          commentId: created.id,
          key: m.meta_key || '',
          value: m.meta_value ? { raw: m.meta_value } : {}
        })),
        skipDuplicates: true
      })
    }
  }
}

/**
 * 6) TERMS / TAXONOMIES / RELATIONSHIPS
 *    - terms: upsert po slug-u
 *    - taxonomies: upsert po (termId, taxonomy) ili po id-u ako želiš
 *    - relationships: mapiraj object_id → target model (page/article/portfolio/product) po WP post_type
 */
async function migrateTerms() {
  console.log('🏷️ Migrating terms & taxonomies...')

  // 1) TERMS
  const wpTerms = await mysql.as_terms.findMany()
  for (const t of wpTerms) {
    await pg.term.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        group: Number(t.term_group) || 0
      },
      create: {
        slug: t.slug,
        name: t.name,
        group: Number(t.term_group) || 0
      }
    })
  }

  // 2) TAXONOMIES - prvi prolaz, bez parentId
  const wpTax = await mysql.as_term_taxonomy.findMany()
  for (const tx of wpTax) {
    const termRow = await mysql.as_terms.findUnique({ where: { term_id: tx.term_id } })
    if (!termRow) continue

    const pgTerm = await pg.term.findUnique({ where: { slug: termRow.slug } })
    if (!pgTerm) continue

    await pg.termTaxonomy.upsert({
      where: { id: 0 }, // fake upsert (možeš staviti unique kombinaciju ako postoji)
      update: {
        termId: pgTerm.id,
        taxonomy: tx.taxonomy,
        description: tx.description || null,
        count: Number(tx.count) || 0
      },
      create: {
        termId: pgTerm.id,
        taxonomy: tx.taxonomy,
        description: tx.description || null,
        count: Number(tx.count) || 0,
        parentId: null // parent kasnije
      }
    })
  }

  // 3) TAXONOMIES - drugi prolaz, update parentId
  for (const tx of wpTax) {
    if (toInt(tx.parent) === 0) continue

    const parentTx = await mysql.as_term_taxonomy.findUnique({
      where: { term_taxonomy_id: tx.parent }
    })
    if (!parentTx) continue

    const parentTerm = await mysql.as_terms.findUnique({
      where: { term_id: parentTx.term_id }
    })
    if (!parentTerm) continue

    const pgParentTerm = await pg.term.findUnique({ where: { slug: parentTerm.slug } })
    if (!pgParentTerm) continue

    const pgParentTx = await pg.termTaxonomy.findFirst({
      where: { termId: pgParentTerm.id, taxonomy: parentTx.taxonomy }
    })
    if (!pgParentTx) continue

    const childTerm = await mysql.as_terms.findUnique({
      where: { term_id: tx.term_id }
    })
    if (!childTerm) continue

    const pgChildTerm = await pg.term.findUnique({ where: { slug: childTerm.slug } })
    if (!pgChildTerm) continue

    const pgChildTx = await pg.termTaxonomy.findFirst({
      where: { termId: pgChildTerm.id, taxonomy: tx.taxonomy }
    })
    if (!pgChildTx) continue

    await pg.termTaxonomy.update({
      where: { id: pgChildTx.id },
      data: { parentId: pgParentTx.id }
    })
  }

  // 4) RELATIONSHIPS - ostaje isto kao prije
  const wpRel = await mysql.as_term_relationships.findMany()
  for (const r of wpRel) {
    const tax = await mysql.as_term_taxonomy.findUnique({
      where: { term_taxonomy_id: r.term_taxonomy_id }
    })
    if (!tax) continue

    const termRow = await mysql.as_terms.findUnique({ where: { term_id: tax.term_id } })
    if (!termRow) continue

    const pgTerm = await pg.term.findUnique({ where: { slug: termRow.slug } })
    if (!pgTerm) continue

    // nađi PG termTaxonomy: najbliže ćemo ga locirati po (termId, taxonomy)
    const pgTax = await pg.termTaxonomy.findFirst({
      where: { termId: pgTerm.id, taxonomy: tax.taxonomy },
      orderBy: { id: 'asc' }
    })
    if (!pgTax) continue

    // mapiraj object_id → target model po WP post_type
    const objectId = toInt(r.object_id)
    const postType = await getWpPostTypeById(objectId)

    if (postType === 'page') {
      const wpPage = await mysql.as_posts.findUnique({ where: { ID: BigInt(objectId) } })
      const pgPage = wpPage
        ? await pg.page.findUnique({
            where: { slug: wpPage.post_name || `post-${String(wpPage.ID)}` }
          })
        : null
      if (!pgPage) continue

      await pg.termRelationship.create({
        data: {
          pageId: pgPage.id,
          termTaxonomyId: pgTax.id
        }
      })
    } else if (postType === 'post') {
      const wpArt = await mysql.as_posts.findUnique({ where: { ID: BigInt(objectId) } })
      const pgArt = wpArt
        ? await pg.article.findUnique({
            where: { slug: wpArt.post_name || `post-${String(wpArt.ID)}` }
          })
        : null
      if (!pgArt) continue

      await pg.termRelationship.create({
        data: {
          articleId: pgArt.id,
          termTaxonomyId: pgTax.id
        }
      })
    } else if (postType === 'portfolio') {
      const wpPort = await mysql.as_posts.findUnique({ where: { ID: BigInt(objectId) } })
      const pgPort = wpPort
        ? await pg.portfolio.findUnique({
            where: { slug: wpPort.post_name || `post-${String(wpPort.ID)}` }
          })
        : null
      if (!pgPort) continue

      await pg.termRelationship.create({
        data: {
          portfolioId: pgPort.id,
          termTaxonomyId: pgTax.id
        }
      })
    } else if (postType === 'product') {
      const wpProd = await mysql.as_posts.findUnique({ where: { ID: BigInt(objectId) } })
      const pgProd = wpProd
        ? await pg.product.findUnique({
            where: { slug: wpProd.post_name || `product-${String(wpProd.ID)}` }
          })
        : null
      if (!pgProd) continue

      await pg.termRelationship.create({
        data: {
          productId: pgProd.id,
          termTaxonomyId: pgTax.id
        }
      })
    } else {
      // ignore other object types
      continue
    }
  }
}

/**
 * 7) MENUS (nav_menu + nav_menu_item → JSON)
 */
async function migrateMenus() {
  console.log('📂 Migrating menus...')

  const menuTaxonomies = await mysql.as_term_taxonomy.findMany({
    where: { taxonomy: 'nav_menu' }
  })

  for (const tx of menuTaxonomies) {
    const term = await mysql.as_terms.findUnique({ where: { term_id: tx.term_id } })
    if (!term) continue

    // Find all nav_menu_item posts linked to this menu
    const relItems = await mysql.as_term_relationships.findMany({
      where: { term_taxonomy_id: tx.term_taxonomy_id }
    })

    const itemIds = relItems.map((r) => r.object_id)
    if (!itemIds.length) {
      await pg.menu.upsert({
        where: { name: term.name },
        update: { location: term.slug },
        create: { name: term.name, location: term.slug }
      })
      continue
    }

    const items = await mysql.as_posts.findMany({
      where: { ID: { in: itemIds } }
    })

    // Create or update menu
    const menu = await pg.menu.upsert({
      where: { name: term.name },
      update: { location: term.slug },
      create: { name: term.name, location: term.slug }
    })

    // Build menu item structure
    const menuItemsData: any[] = []
    for (const i of items) {
      const metas = await mysql.as_postmeta.findMany({ where: { post_id: i.ID } })
      const objId = metas.find((m) => m.meta_key === '_menu_item_object_id')?.meta_value
      const url = metas.find((m) => m.meta_key === '_menu_item_url')?.meta_value
      const parent = metas.find((m) => m.meta_key === '_menu_item_menu_item_parent')?.meta_value
      const type = metas.find((m) => m.meta_key === '_menu_item_type')?.meta_value
      const object = metas.find((m) => m.meta_key === '_menu_item_object')?.meta_value
      const menuOrder = metas.find((m) => m.meta_key === '_menu_item_menu_order')?.meta_value

      // Get title from linked post/page if empty
      let title = i.post_title || ''
      if (!title && type === 'post_type' && objId) {
        const linkedPost = await mysql.as_posts.findUnique({ where: { ID: BigInt(objId) } })
        title = linkedPost?.post_title || ''
      }

      menuItemsData.push({
        wpId: toInt(i.ID),
        title,
        objectId: objId ? Number(objId) : null,
        url: url || null,
        wpParentId: parent ? Number(parent) : null,
        type: type || null,
        object: object || null,
        order: menuOrder ? Number(menuOrder) : 0
      })
    }

    // Sort by menu order
    menuItemsData.sort((a, b) => a.order - b.order)

    // Create menu items with parent relationships
    const wpIdToDbId = new Map<number, number>()

    // First pass: create all items
    for (const itemData of menuItemsData) {
      // Map WordPress object IDs to PostgreSQL IDs
      let pgPageId = null
      let pgArticleId = null

      if (itemData.type === 'post_type' && itemData.objectId) {
        if (itemData.object === 'page') {
          pgPageId = pageIdMap.get(itemData.objectId) || null
        } else if (itemData.object === 'post') {
          pgArticleId = articleIdMap.get(itemData.objectId) || null
        }
      }

      const menuItem = await pg.menuItem.create({
        data: {
          menuId: menu.id,
          title: itemData.title,
          url: itemData.url || '',
          order: itemData.order,
          pageId: pgPageId,
          articleId: pgArticleId
        }
      })
      wpIdToDbId.set(itemData.wpId, menuItem.id)
    }

    // Second pass: update parent relationships
    for (const itemData of menuItemsData) {
      if (itemData.wpParentId && itemData.wpParentId !== 0) {
        const dbParentId = wpIdToDbId.get(itemData.wpParentId)
        if (dbParentId) {
          const dbId = wpIdToDbId.get(itemData.wpId)
          if (dbId) {
            await pg.menuItem.update({
              where: { id: dbId },
              data: { parentId: dbParentId }
            })
          }
        }
      }
    }

    console.log(`  ✓ Migrated menu: ${term.name} (${menuItemsData.length} items)`)
  }
}

/**
 * 7) MEDIA & ATTACHMENTS (WordPress wp_posts where post_type='attachment')
 */
async function migrateMedia() {
  console.log('🖼️ Migrating media & attachments...')

  // Get all WordPress attachments
  const wpAttachments = await mysql.as_posts.findMany({
    where: {
      post_type: 'attachment',
      post_status: { not: 'trash' }
    },
    orderBy: { ID: 'asc' }
  })

  console.log(`  Found ${wpAttachments.length} WordPress attachments`)

  for (const att of wpAttachments) {
    try {
      // Get attachment metadata
      const fileMeta = await mysql.as_postmeta.findFirst({
        where: {
          post_id: att.ID,
          meta_key: '_wp_attached_file'
        }
      })

      const metadataMeta = await mysql.as_postmeta.findFirst({
        where: {
          post_id: att.ID,
          meta_key: '_wp_attachment_metadata'
        }
      })

      const altMeta = await mysql.as_postmeta.findFirst({
        where: {
          post_id: att.ID,
          meta_key: '_wp_attachment_image_alt'
        }
      })

      if (!fileMeta?.meta_value) {
        console.log(`  ⚠️ Skipping attachment ${att.ID} - no file path`)
        continue
      }

      const filePath = `/uploads/${fileMeta.meta_value}`
      const filename = filePath.split('/').pop() || 'unknown'

      // Parse metadata JSON
      let metadata: any = {}
      let width: number | null = null
      let height: number | null = null
      let sizes: any = {}

      if (metadataMeta?.meta_value) {
        try {
          // WordPress stores as PHP serialized or JSON
          const metaStr = metadataMeta.meta_value
          if (metaStr.startsWith('{')) {
            metadata = JSON.parse(metaStr)
          } else {
            // Try to extract dimensions from serialized PHP
            const widthMatch = metaStr.match(/"width";i:(\d+)/)
            const heightMatch = metaStr.match(/"height";i:(\d+)/)
            if (widthMatch) width = parseInt(widthMatch[1])
            if (heightMatch) height = parseInt(heightMatch[1])

            // Extract sizes array
            const sizesMatch = metaStr.match(/"sizes";a:\d+:{(.+?)}/)
            if (sizesMatch) {
              // Parse size names (thumbnail, medium, large, etc.)
              const sizeNames = metaStr.match(/"([^"]+)";a:/g)
              if (sizeNames) {
                sizes = {}
                for (const sizeName of sizeNames) {
                  const name = sizeName.match(/"([^"]+)"/)?.[1]
                  if (
                    name &&
                    ['thumbnail', 'medium', 'large', 'medium_large', 'full'].includes(name)
                  ) {
                    sizes[name] = { file: filename, width: 0, height: 0 }
                  }
                }
              }
            }
          }

          if (metadata.width) width = metadata.width
          if (metadata.height) height = metadata.height
          if (metadata.sizes) sizes = metadata.sizes
        } catch (e) {
          console.log(`  ⚠️ Failed to parse metadata for attachment ${att.ID}`)
        }
      }

      // Create media record
      const media = await pg.media.create({
        data: {
          wpAttachmentId: Number(att.ID),
          filename,
          filePath,
          mimeType: att.post_mime_type || 'application/octet-stream',
          fileSize: null, // WordPress doesn't always store filesize
          width,
          height,
          alt: altMeta?.meta_value || null,
          caption: att.post_excerpt || null,
          title: att.post_title,
          uploadedBy: null, // Could map from post_author if needed
          uploadedAt: att.post_date,
          metadata: metadata
        }
      })

      // Create size variants
      if (sizes && typeof sizes === 'object') {
        const sizeEntries = Object.entries(sizes)

        for (const [sizeName, sizeData] of sizeEntries) {
          const sd = sizeData as any
          if (!sd.file) continue

          const sizeFilePath = filePath.replace(filename, sd.file)

          await pg.mediaSize.create({
            data: {
              mediaId: media.id,
              sizeName,
              filePath: sizeFilePath,
              width: sd.width || null,
              height: sd.height || null,
              fileSize: sd.filesize || null
            }
          })
        }
      }

      console.log(`  ✓ Imported media: ${filename} (WP ID: ${att.ID}, PG ID: ${media.id})`)
    } catch (error) {
      console.error(`  ❌ Error importing attachment ${att.ID}:`, error)
    }
  }

  console.log(`  ✅ Media migration completed`)
}

/**
 * 8) LINK FEATURED IMAGES to Articles/Pages/Portfolios
 */
async function linkFeaturedImages() {
  console.log('🔗 Linking featured images...')

  // Articles
  const articleMetas = await mysql.as_postmeta.findMany({
    where: {
      meta_key: '_thumbnail_id'
    }
  })

  for (const meta of articleMetas) {
    const wpPost = await mysql.as_posts.findUnique({
      where: { ID: meta.post_id }
    })

    if (!wpPost || wpPost.post_type !== 'post') continue

    const pgArticle = await pg.article.findFirst({
      where: { slug: wpPost.post_name }
    })

    if (!pgArticle) continue

    const wpAttachmentId = Number(meta.meta_value)
    const pgMedia = await pg.media.findFirst({
      where: { wpAttachmentId }
    })

    if (!pgMedia) {
      console.log(`  ⚠️ Featured image ${wpAttachmentId} not found for article ${wpPost.post_name}`)
      continue
    }

    // Check if meta already exists
    const existingMeta = await pg.articleMeta.findFirst({
      where: {
        articleId: pgArticle.id,
        key: 'featured_image'
      }
    })

    if (existingMeta) {
      await pg.articleMeta.update({
        where: { id: existingMeta.id },
        data: { mediaId: pgMedia.id }
      })
    } else {
      await pg.articleMeta.create({
        data: {
          articleId: pgArticle.id,
          key: 'featured_image',
          value: { wp_attachment_id: wpAttachmentId },
          mediaId: pgMedia.id
        }
      })
    }

    console.log(`  ✓ Linked featured image to article: ${wpPost.post_name}`)
  }

  // Pages
  const pageMetas = await mysql.as_postmeta.findMany({
    where: {
      meta_key: '_thumbnail_id'
    }
  })

  for (const meta of pageMetas) {
    const wpPost = await mysql.as_posts.findUnique({
      where: { ID: meta.post_id }
    })

    if (!wpPost || wpPost.post_type !== 'page') continue

    const pgPage = await pg.page.findFirst({
      where: { slug: wpPost.post_name }
    })

    if (!pgPage) continue

    const wpAttachmentId = Number(meta.meta_value)
    const pgMedia = await pg.media.findFirst({
      where: { wpAttachmentId }
    })

    if (!pgMedia) {
      console.log(`  ⚠️ Featured image ${wpAttachmentId} not found for page ${wpPost.post_name}`)
      continue
    }

    const existingMeta = await pg.pageMeta.findFirst({
      where: {
        pageId: pgPage.id,
        key: 'featured_image'
      }
    })

    if (existingMeta) {
      await pg.pageMeta.update({
        where: { id: existingMeta.id },
        data: { mediaId: pgMedia.id }
      })
    } else {
      await pg.pageMeta.create({
        data: {
          pageId: pgPage.id,
          key: 'featured_image',
          value: { wp_attachment_id: wpAttachmentId },
          mediaId: pgMedia.id
        }
      })
    }

    console.log(`  ✓ Linked featured image to page: ${wpPost.post_name}`)
  }

  // Portfolios
  const portfolioMetas = await mysql.as_postmeta.findMany({
    where: {
      meta_key: '_thumbnail_id'
    }
  })

  for (const meta of portfolioMetas) {
    const wpPost = await mysql.as_posts.findUnique({
      where: { ID: meta.post_id }
    })

    if (!wpPost || wpPost.post_type !== 'portfolio') continue

    const pgPortfolio = await pg.portfolio.findFirst({
      where: { slug: wpPost.post_name }
    })

    if (!pgPortfolio) continue

    const wpAttachmentId = Number(meta.meta_value)
    const pgMedia = await pg.media.findFirst({
      where: { wpAttachmentId }
    })

    if (!pgMedia) {
      console.log(
        `  ⚠️ Featured image ${wpAttachmentId} not found for portfolio ${wpPost.post_name}`
      )
      continue
    }

    const existingMeta = await pg.portfolioMeta.findFirst({
      where: {
        portfolioId: pgPortfolio.id,
        key: 'featured_image'
      }
    })

    if (existingMeta) {
      await pg.portfolioMeta.update({
        where: { id: existingMeta.id },
        data: { mediaId: pgMedia.id }
      })
    } else {
      await pg.portfolioMeta.create({
        data: {
          portfolioId: pgPortfolio.id,
          key: 'featured_image',
          value: { wp_attachment_id: wpAttachmentId },
          mediaId: pgMedia.id
        }
      })
    }

    console.log(`  ✓ Linked featured image to portfolio: ${wpPost.post_name}`)
  }

  console.log(`  ✅ Featured images linked`)
}

/**
 * 8) SETTINGS (options)
 */
async function migrateSettings() {
  console.log('⚙️ Migrating settings...')

  const wpOptions = await mysql.as_options.findMany()

  for (const o of wpOptions) {
    let parsed: any = o.option_value
    try {
      parsed = JSON.parse(o.option_value)
    } catch {
      parsed = o.option_value
    }
    // ukloni eventualne null byte znakove
    if (typeof parsed === 'string') {
      parsed = parsed.replace(/\u0000/g, '')
    }

    await pg.setting.upsert({
      where: { key: o.option_name },
      update: { value: parsed },
      create: { key: o.option_name, value: parsed }
    })
  }
}

/**
 * MAIN
 */
async function main() {
  console.log('🚀 Starting migration...')
  await clearCMS()

  await migrateUsers()
  await migrateContent()
  await migrateProducts()
  await migrateMedia() // ✅ Import WordPress attachments
  await linkFeaturedImages() // ✅ Link featured images to content
  await migrateComments()
  await migrateTerms()
  await migrateMenus() // ✅ Migrate WordPress menus
  await migrateSettings()

  console.log('✅ Migration completed!')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await mysql.$disconnect()
    await pg.$disconnect()
  })
