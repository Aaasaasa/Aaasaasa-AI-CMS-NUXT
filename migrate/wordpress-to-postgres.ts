// migrate/wordpress-to-postgres-v2.ts
// WordPress zu PostgreSQL Migration - verbesserte Version nach bewährten Patterns

import { PrismaClient as MySQLClient } from '../prisma/generated/mysql/index.js'
import { PrismaClient as PostgresCMSClient } from '../prisma/generated/postgres-cms/index.js'
import dotenv from 'dotenv'

dotenv.config()

const mysql = new MySQLClient()
const pg = new PostgresCMSClient()

interface MigrationConfig {
  wpPrefix: string
  defaultLanguage: string
}

const config: MigrationConfig = {
  wpPrefix: process.env.DB_PREFIX || 'as_',
  defaultLanguage: 'de'
}

// Utility functions
function toInt(v: any): number {
  return v ? Number(v) : 0
}

function mapStatus(status: string): 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'ARCHIVED' {
  switch (status) {
    case 'publish':
      return 'PUBLISHED'
    case 'draft':
      return 'DRAFT'
    case 'pending':
      return 'PENDING'
    default:
      return 'ARCHIVED'
  }
}

function mapUserRole(
  userId: number
): 'SUPERADMIN' | 'ADMIN' | 'AUTHOR' | 'CONTRIBUTOR' | 'SUBSCRIBER' {
  return userId === 1 ? 'SUPERADMIN' : 'AUTHOR'
}

// Get table name with prefix
function getTableName(table: string): string {
  return `${config.wpPrefix}${table}`
}

/**
 * 1) CLEAR CMS TABLES
 */
async function clearCMS() {
  console.log('🧹 Bereinige PostgreSQL Datenbank...')

  await pg.$executeRawUnsafe(`
    TRUNCATE TABLE
      cms_user_meta, cms_users,
      cms_page_meta, cms_page_translations, cms_pages,
      cms_article_meta, cms_article_translations, cms_articles,
      cms_portfolio_meta, cms_portfolio_translations, cms_portfolios,
      cms_product_meta, cms_product_translations, cms_products,
      cms_comment_meta, cms_comments,
      cms_term_relationships, cms_term_taxonomies, cms_terms,
      "MenuItem", "Menu", cms_settings
    RESTART IDENTITY CASCADE
  `)

  console.log('✅ PostgreSQL bereinigt')
}

/**
 * 2) MIGRATE USERS
 */
async function migrateUsers() {
  console.log('👥 Migriere WordPress Benutzer...')

  // Use the generated Prisma model names from your schema
  const wpUsers = (await mysql.$queryRawUnsafe(`
    SELECT * FROM ${getTableName('users')} ORDER BY ID
  `)) as any[]

  let imported = 0

  for (const u of wpUsers) {
    try {
      const user = await pg.user.upsert({
        where: { email: u.user_email || `user-${u.ID}@example.local` },
        update: {
          login: u.user_login,
          password: u.user_pass,
          displayName: u.display_name,
          role: mapUserRole(u.ID),
          createdAt: u.user_registered,
          isActive: u.user_status === 0
        },
        create: {
          login: u.user_login,
          email: u.user_email || `user-${u.ID}@example.local`,
          password: u.user_pass,
          displayName: u.display_name,
          role: mapUserRole(u.ID),
          createdAt: u.user_registered,
          isActive: u.user_status === 0
        }
      })

      // User meta
      const metas = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('usermeta')} WHERE user_id = ${u.ID}
      `)) as any[]

      if (metas.length) {
        await pg.userMeta.createMany({
          data: metas.map((m: any) => ({
            userId: user.id,
            key: m.meta_key || '',
            value: m.meta_value ? { raw: m.meta_value } : {}
          })),
          skipDuplicates: true
        })
      }

      imported++
      console.log(`✅ Benutzer importiert: ${u.user_login}`)
    } catch (error) {
      console.log(`❌ Fehler beim Importieren von Benutzer ${u.user_login}:`, error)
    }
  }

  console.log(`👥 ${imported} Benutzer importiert`)
}

/**
 * 3) MIGRATE TERMS & TAXONOMIES
 */
async function migrateTerms() {
  console.log('🏷️  Migriere WordPress Begriffe und Kategorien...')

  // 1) Terms first
  const wpTerms = (await mysql.$queryRawUnsafe(`
    SELECT * FROM ${getTableName('terms')} ORDER BY term_id
  `)) as any[]

  let imported = 0

  for (const t of wpTerms) {
    try {
      await pg.term.upsert({
        where: { slug: t.slug },
        update: {
          name: t.name,
          group: toInt(t.term_group)
        },
        create: {
          slug: t.slug,
          name: t.name,
          group: toInt(t.term_group)
        }
      })
      imported++
    } catch (error) {
      console.log(`❌ Fehler beim Importieren von Begriff ${t.name}:`, error)
    }
  }

  // 2) Taxonomies - first pass without parentId
  const wpTaxonomies = (await mysql.$queryRawUnsafe(`
    SELECT * FROM ${getTableName('term_taxonomy')} ORDER BY term_taxonomy_id
  `)) as any[]

  for (const tx of wpTaxonomies) {
    try {
      const termRow = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('terms')} WHERE term_id = ${tx.term_id} LIMIT 1
      `)) as any[]

      if (!termRow.length) continue

      const pgTerm = await pg.term.findUnique({ where: { slug: termRow[0].slug } })
      if (!pgTerm) continue

      await pg.termTaxonomy.create({
        data: {
          termId: pgTerm.id,
          taxonomy: tx.taxonomy,
          description: tx.description || null,
          count: toInt(tx.count),
          parentId: null // set in second pass
        }
      })
    } catch (error) {
      console.log(`❌ Fehler beim Importieren von Taxonomie:`, error)
    }
  }

  // 3) Taxonomies - second pass for parentId
  for (const tx of wpTaxonomies) {
    if (toInt(tx.parent) === 0) continue

    try {
      const parentTx = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('term_taxonomy')} WHERE term_taxonomy_id = ${tx.parent} LIMIT 1
      `)) as any[]

      if (!parentTx.length) continue

      const parentTerm = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('terms')} WHERE term_id = ${parentTx[0].term_id} LIMIT 1
      `)) as any[]

      if (!parentTerm.length) continue

      const pgParentTerm = await pg.term.findUnique({ where: { slug: parentTerm[0].slug } })
      if (!pgParentTerm) continue

      const pgParentTx = await pg.termTaxonomy.findFirst({
        where: { termId: pgParentTerm.id, taxonomy: parentTx[0].taxonomy }
      })
      if (!pgParentTx) continue

      const childTerm = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('terms')} WHERE term_id = ${tx.term_id} LIMIT 1
      `)) as any[]

      if (!childTerm.length) continue

      const pgChildTerm = await pg.term.findUnique({ where: { slug: childTerm[0].slug } })
      if (!pgChildTerm) continue

      const pgChildTx = await pg.termTaxonomy.findFirst({
        where: { termId: pgChildTerm.id, taxonomy: tx.taxonomy }
      })
      if (!pgChildTx) continue

      await pg.termTaxonomy.update({
        where: { id: pgChildTx.id },
        data: { parentId: pgParentTx.id }
      })
    } catch (error) {
      console.log(`❌ Fehler beim Update von Parent-Taxonomie:`, error)
    }
  }

  console.log(`🏷️  ${imported} Begriffe importiert`)
}

/**
 * 4) MIGRATE CONTENT (Posts, Pages, Portfolios)
 */
async function migrateContent() {
  console.log('📝 Migriere WordPress Posts und Pages...')

  const wpPosts = (await mysql.$queryRawUnsafe(`
    SELECT * FROM ${getTableName('posts')}
    WHERE post_status IN ('publish', 'draft', 'private')
    ORDER BY post_date DESC
  `)) as any[]

  let postsImported = 0
  let pagesImported = 0

  for (const p of wpPosts) {
    try {
      const base = {
        slug: p.post_name || `post-${p.ID}`,
        status: mapStatus(p.post_status),
        authorId: toInt(p.post_author) || 1,
        createdAt: p.post_date,
        updatedAt: p.post_modified
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

        await pg.articleTranslation.upsert({
          where: { articleId_lang: { articleId: article.id, lang: config.defaultLanguage } },
          update: {
            title: p.post_title || '',
            content: p.post_content || '',
            excerpt: p.post_excerpt || ''
          },
          create: {
            articleId: article.id,
            lang: config.defaultLanguage,
            title: p.post_title || '',
            content: p.post_content || '',
            excerpt: p.post_excerpt || ''
          }
        })

        postsImported++
      } else if (p.post_type === 'page') {
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

        await pg.pageTranslation.upsert({
          where: { pageId_lang: { pageId: page.id, lang: config.defaultLanguage } },
          update: {
            title: p.post_title || '',
            content: p.post_content || '',
            excerpt: p.post_excerpt || ''
          },
          create: {
            pageId: page.id,
            lang: config.defaultLanguage,
            title: p.post_title || '',
            content: p.post_content || '',
            excerpt: p.post_excerpt || ''
          }
        })

        pagesImported++
      } else if (p.post_type === 'avada_portfolio') {
        const portfolio = await pg.portfolio.upsert({
          where: { slug: base.slug },
          update: {
            status: base.status,
            authorId: base.authorId,
            updatedAt: base.updatedAt
          },
          create: base
        })

        await pg.portfolioTranslation.upsert({
          where: { portfolioId_lang: { portfolioId: portfolio.id, lang: config.defaultLanguage } },
          update: {
            title: p.post_title || '',
            content: p.post_content || '',
            excerpt: p.post_excerpt || ''
          },
          create: {
            portfolioId: portfolio.id,
            lang: config.defaultLanguage,
            title: p.post_title || '',
            content: p.post_content || '',
            excerpt: p.post_excerpt || ''
          }
        })

        postsImported++ // Count portfolios with posts for simplicity
      }

      // Meta fields
      const metas = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('postmeta')} WHERE post_id = ${p.ID}
      `)) as any[]

      if (metas.length && p.post_type === 'post') {
        const article = await pg.article.findUnique({ where: { slug: base.slug } })
        if (article) {
          await pg.articleMeta.createMany({
            data: metas.map((m: any) => ({
              articleId: article.id,
              key: m.meta_key || '',
              value: m.meta_value ? { raw: m.meta_value } : {}
            })),
            skipDuplicates: true
          })
        }
      }

      if (metas.length && p.post_type === 'page') {
        const page = await pg.page.findUnique({ where: { slug: base.slug } })
        if (page) {
          await pg.pageMeta.createMany({
            data: metas.map((m: any) => ({
              pageId: page.id,
              key: m.meta_key || '',
              value: m.meta_value ? { raw: m.meta_value } : {}
            })),
            skipDuplicates: true
          })
        }
      }

      if (metas.length && p.post_type === 'avada_portfolio') {
        const portfolio = await pg.portfolio.findUnique({ where: { slug: base.slug } })
        if (portfolio) {
          await pg.portfolioMeta.createMany({
            data: metas.map((m: any) => ({
              portfolioId: portfolio.id,
              key: m.meta_key || '',
              value: m.meta_value ? { raw: m.meta_value } : {}
            })),
            skipDuplicates: true
          })
        }
      }
    } catch (error) {
      console.log(`❌ Fehler beim Importieren von Post ${p.post_title}:`, error)
    }
  }

  console.log(`📝 ${postsImported} Posts und ${pagesImported} Pages importiert`)
}

/**
 * 5) MIGRATE COMMENTS
 */
async function migrateComments() {
  console.log('💬 Migriere WordPress Kommentare...')

  const wpComments = (await mysql.$queryRawUnsafe(`
    SELECT * FROM ${getTableName('comments')}
    WHERE comment_approved = '1'
    ORDER BY comment_date DESC
  `)) as any[]

  let imported = 0

  for (const c of wpComments) {
    try {
      const targetPostId = toInt(c.comment_post_ID)

      // Find the target post
      const targetPost = (await mysql.$queryRawUnsafe(`
        SELECT * FROM ${getTableName('posts')} WHERE ID = ${targetPostId} LIMIT 1
      `)) as any[]

      if (!targetPost.length) continue

      const post = targetPost[0]
      const baseComment = {
        userId: toInt(c.user_id) || null,
        content: c.comment_content || '',
        status: c.comment_approved === '1' ? 'approved' : 'pending',
        createdAt: c.comment_date,
        updatedAt: c.comment_date_gmt
      }

      let created
      if (post.post_type === 'post') {
        const pgArticle = await pg.article.findUnique({
          where: { slug: post.post_name || `post-${post.ID}` }
        })

        created = await pg.comment.create({
          data: {
            ...baseComment,
            articleId: pgArticle ? pgArticle.id : null
          }
        })
      } else if (post.post_type === 'page') {
        const pgPage = await pg.page.findUnique({
          where: { slug: post.post_name || `post-${post.ID}` }
        })

        created = await pg.comment.create({
          data: {
            ...baseComment,
            pageId: pgPage ? pgPage.id : null
          }
        })
      } else {
        created = await pg.comment.create({ data: baseComment })
      }

      imported++
    } catch (error) {
      console.log(`❌ Fehler beim Importieren von Kommentar:`, error)
    }
  }

  console.log(`💬 ${imported} Kommentare importiert`)
}

/**
 * 6) MIGRATE TERM RELATIONSHIPS
 */
async function migrateTermRelationships() {
  console.log('🔗 Migriere WordPress Term Relationships (Categories/Tags)...')

  const wpRelationships = (await mysql.$queryRawUnsafe(`
    SELECT
      tr.object_id,
      tr.term_taxonomy_id,
      tt.taxonomy,
      tt.term_id,
      t.slug,
      t.name,
      p.post_type,
      p.post_name
    FROM ${getTableName('term_relationships')} tr
    LEFT JOIN ${getTableName('term_taxonomy')} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
    LEFT JOIN ${getTableName('terms')} t ON tt.term_id = t.term_id
    LEFT JOIN ${getTableName('posts')} p ON tr.object_id = p.ID
    WHERE p.post_type IN ('post', 'page', 'avada_portfolio')
    AND tt.taxonomy IN ('category', 'post_tag', 'portfolio_category', 'portfolio_tags')
    ORDER BY tr.object_id
  `)) as any[]

  console.log(`📄 Gefunden: ${wpRelationships.length} Relationships`)

  let imported = 0

  for (const rel of wpRelationships) {
    try {
      // Find PostgreSQL term
      const pgTerm = await pg.term.findUnique({ where: { slug: rel.slug } })
      if (!pgTerm) continue

      // Find PostgreSQL taxonomy
      const pgTaxonomy = await pg.termTaxonomy.findFirst({
        where: { termId: pgTerm.id, taxonomy: rel.taxonomy }
      })
      if (!pgTaxonomy) continue

      // Find PostgreSQL content by post_type and slug
      let relationshipData: any = { termTaxonomyId: pgTaxonomy.id }

      if (rel.post_type === 'post') {
        const pgArticle = await pg.article.findUnique({ where: { slug: rel.post_name } })
        if (pgArticle) {
          relationshipData.articleId = pgArticle.id
        } else continue
      } else if (rel.post_type === 'page') {
        const pgPage = await pg.page.findUnique({ where: { slug: rel.post_name } })
        if (pgPage) {
          relationshipData.pageId = pgPage.id
        } else continue
      } else if (rel.post_type === 'avada_portfolio') {
        const pgPortfolio = await pg.portfolio.findUnique({ where: { slug: rel.post_name } })
        if (pgPortfolio) {
          relationshipData.portfolioId = pgPortfolio.id
        } else continue
      } else continue

      // Create relationship (with upsert to avoid duplicates)
      await pg.termRelationship.create({ data: relationshipData })
      imported++

      if (imported % 50 === 0) {
        console.log(`   Imported ${imported}/${wpRelationships.length} relationships...`)
      }
    } catch (error) {
      // Skip duplicates silently
      if (error instanceof Error && !error.message?.includes('Unique constraint')) {
        console.log(`⚠️ Skipping relationship for ${rel.post_name}:`, error.message)
      }
    }
  }

  console.log(`🔗 ${imported} Term Relationships importiert`)
}

/**
 * 7) MIGRATE MENUS
 */
async function migrateMenus() {
  console.log('🍽️ Migriere WordPress Menüs...')

  // Get WordPress menus
  const wpMenus = (await mysql.$queryRawUnsafe(`
    SELECT t.term_id, t.name, t.slug, tt.description
    FROM ${getTableName('terms')} t
    LEFT JOIN ${getTableName('term_taxonomy')} tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'nav_menu'
    ORDER BY t.term_id
  `)) as any[]

  console.log(`📄 Gefunden: ${wpMenus.length} WordPress Menüs`)

  let menusImported = 0
  let itemsImported = 0

  for (const wpMenu of wpMenus) {
    try {
      // Create menu
      const pgMenu = await pg.menu.create({
        data: {
          name: wpMenu.slug || wpMenu.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          location: wpMenu.slug || 'menu-' + wpMenu.term_id,
          isActive: true
        }
      })
      menusImported++

      // Get menu items with corrected meta keys
      const wpMenuItems = (await mysql.$queryRawUnsafe(`
        SELECT
          tr.object_id,
          p.post_title,
          p.post_name,
          p.post_type,
          p.menu_order,
          pm_parent.meta_value as menu_item_parent,
          pm_type.meta_value as menu_item_type,
          pm_object_id.meta_value as menu_item_object_id,
          pm_object.meta_value as menu_item_object,
          pm_url.meta_value as menu_item_url,
          pm_target.meta_value as menu_item_target,
          pm_attr_title.meta_value as menu_item_attr_title,
          pm_classes.meta_value as menu_item_classes,
          pm_xfn.meta_value as menu_item_xfn,
          pm_description.meta_value as menu_item_description
        FROM ${getTableName('term_relationships')} tr
        LEFT JOIN ${getTableName('posts')} p ON tr.object_id = p.ID
        LEFT JOIN ${getTableName('postmeta')} pm_parent ON p.ID = pm_parent.post_id AND pm_parent.meta_key = '_menu_item_menu_item_parent'
        LEFT JOIN ${getTableName('postmeta')} pm_type ON p.ID = pm_type.post_id AND pm_type.meta_key = '_menu_item_type'
        LEFT JOIN ${getTableName('postmeta')} pm_object_id ON p.ID = pm_object_id.post_id AND pm_object_id.meta_key = '_menu_item_object_id'
        LEFT JOIN ${getTableName('postmeta')} pm_object ON p.ID = pm_object.post_id AND pm_object.meta_key = '_menu_item_object'
        LEFT JOIN ${getTableName('postmeta')} pm_url ON p.ID = pm_url.post_id AND pm_url.meta_key = '_menu_item_url'
        LEFT JOIN ${getTableName('postmeta')} pm_target ON p.ID = pm_target.post_id AND pm_target.meta_key = '_menu_item_target'
        LEFT JOIN ${getTableName('postmeta')} pm_attr_title ON p.ID = pm_attr_title.post_id AND pm_attr_title.meta_key = '_menu_item_attr_title'
        LEFT JOIN ${getTableName('postmeta')} pm_classes ON p.ID = pm_classes.post_id AND pm_classes.meta_key = '_menu_item_classes'
        LEFT JOIN ${getTableName('postmeta')} pm_xfn ON p.ID = pm_xfn.post_id AND pm_xfn.meta_key = '_menu_item_xfn'
        LEFT JOIN ${getTableName('postmeta')} pm_description ON p.ID = pm_description.post_id AND pm_description.meta_key = '_menu_item_description'
        WHERE tr.term_taxonomy_id = (
          SELECT term_taxonomy_id FROM ${getTableName('term_taxonomy')}
          WHERE term_id = ${wpMenu.term_id} AND taxonomy = 'nav_menu'
        )
        AND p.post_type = 'nav_menu_item'
        AND p.post_status = 'publish'
        ORDER BY p.menu_order ASC, p.ID ASC
      `)) as any[]

      console.log(`   Menu "${wpMenu.name}": ${wpMenuItems.length} Items`)

      // Create menu items in two passes: first root items, then child items
      const wpIdToPgIdMap = new Map<string, number>()

      // First pass: Create root items (no parent)
      for (const wpItem of wpMenuItems) {
        if (wpItem.menu_item_parent && wpItem.menu_item_parent !== '0') {
          continue // Skip child items for now
        }

        try {
          // Use post title or attr_title for menu item title
          let title = wpItem.menu_item_attr_title || wpItem.post_title || 'Menu Item'
          let url = null
          let route = null
          let target = wpItem.menu_item_target || '_self'
          let cssClass = wpItem.menu_item_classes || null
          let order = parseInt(wpItem.menu_order) || 0

          console.log(
            `     Processing menu item: "${title}" (type: ${wpItem.menu_item_type}, object: ${wpItem.menu_item_object})`
          )

          // Determine URL based on menu item type
          if (wpItem.menu_item_type === 'custom') {
            url = wpItem.menu_item_url
          } else if (wpItem.menu_item_type === 'post_type') {
            // Get the referenced post/page by object_id
            const objectId = parseInt(wpItem.menu_item_object_id) || 0
            if (objectId > 0) {
              const refPost = (await mysql.$queryRawUnsafe(`
                SELECT post_name, post_type FROM ${getTableName('posts')}
                WHERE ID = ${objectId} LIMIT 1
              `)) as any[]

              if (refPost.length > 0) {
                const post = refPost[0]
                if (post.post_type === 'post') {
                  route = `/articles/${post.post_name}`
                } else if (post.post_type === 'page') {
                  route = `/${post.post_name}` // Direct URL ohne "pages" prefix
                } else if (post.post_type === 'avada_portfolio') {
                  route = `/portfolio/${post.post_name}`
                }

                // If no title was set, use the referenced post's title
                if (!wpItem.menu_item_attr_title && !wpItem.post_title) {
                  const titlePost = (await mysql.$queryRawUnsafe(`
                    SELECT post_title FROM ${getTableName('posts')}
                    WHERE ID = ${objectId} LIMIT 1
                  `)) as any[]
                  if (titlePost.length > 0) {
                    title = titlePost[0].post_title || 'Menu Item'
                  }
                }
              }
            }
          } else if (wpItem.menu_item_type === 'taxonomy') {
            // Get taxonomy term info
            const objectId = parseInt(wpItem.menu_item_object_id) || 0
            if (objectId > 0) {
              const termInfo = (await mysql.$queryRawUnsafe(`
                SELECT t.slug, t.name FROM ${getTableName('terms')} t
                WHERE t.term_id = ${objectId} LIMIT 1
              `)) as any[]

              if (termInfo.length > 0) {
                const term = termInfo[0]
                route = `/category/${term.slug}`

                // Use term name if no title set
                if (!wpItem.menu_item_attr_title && !wpItem.post_title) {
                  title = term.name || 'Menu Item'
                }
              }
            }
          }

          const pgItem = await pg.menuItem.create({
            data: {
              menuId: pgMenu.id,
              parentId: null, // Root item
              title,
              url,
              route,
              target,
              cssClass,
              order,
              isActive: true
            }
          })

          // Map WordPress ID to PostgreSQL ID
          wpIdToPgIdMap.set(wpItem.object_id.toString(), pgItem.id)
          itemsImported++
        } catch (error) {
          console.log(
            `⚠️  Skipping root menu item "${wpItem.post_title}":`,
            error instanceof Error ? error.message : error
          )
        }
      }

      // Second pass: Create child items
      for (const wpItem of wpMenuItems) {
        if (!wpItem.menu_item_parent || wpItem.menu_item_parent === '0') {
          continue // Skip root items - already created
        }

        try {
          // Use post title or attr_title for menu item title
          let title = wpItem.menu_item_attr_title || wpItem.post_title || 'Menu Item'
          let url = null
          let route = null
          let target = wpItem.menu_item_target || '_self'
          let cssClass = wpItem.menu_item_classes || null
          let order = parseInt(wpItem.menu_order) || 0

          console.log(
            `     Processing child menu item: "${title}" (type: ${wpItem.menu_item_type}, object: ${wpItem.menu_item_object})`
          )

          // Determine URL based on menu item type
          if (wpItem.menu_item_type === 'custom') {
            url = wpItem.menu_item_url
          } else if (wpItem.menu_item_type === 'post_type') {
            // Get the referenced post/page by object_id
            const objectId = parseInt(wpItem.menu_item_object_id) || 0
            if (objectId > 0) {
              const refPost = (await mysql.$queryRawUnsafe(`
                SELECT post_name, post_type FROM ${getTableName('posts')}
                WHERE ID = ${objectId} LIMIT 1
              `)) as any[]

              if (refPost.length > 0) {
                const post = refPost[0]
                if (post.post_type === 'post') {
                  route = `/articles/${post.post_name}`
                } else if (post.post_type === 'page') {
                  route = `/${post.post_name}` // Direct URL ohne "pages" prefix
                } else if (post.post_type === 'avada_portfolio') {
                  route = `/portfolio/${post.post_name}`
                }

                // If no title was set, use the referenced post's title
                if (!wpItem.menu_item_attr_title && !wpItem.post_title) {
                  const titlePost = (await mysql.$queryRawUnsafe(`
                    SELECT post_title FROM ${getTableName('posts')}
                    WHERE ID = ${objectId} LIMIT 1
                  `)) as any[]
                  if (titlePost.length > 0) {
                    title = titlePost[0].post_title || 'Menu Item'
                  }
                }
              }
            }
          } else if (wpItem.menu_item_type === 'taxonomy') {
            // Get taxonomy term info
            const objectId = parseInt(wpItem.menu_item_object_id) || 0
            if (objectId > 0) {
              const termInfo = (await mysql.$queryRawUnsafe(`
                SELECT t.slug, t.name FROM ${getTableName('terms')} t
                WHERE t.term_id = ${objectId} LIMIT 1
              `)) as any[]

              if (termInfo.length > 0) {
                const term = termInfo[0]
                route = `/category/${term.slug}`

                // Use term name if no title set
                if (!wpItem.menu_item_attr_title && !wpItem.post_title) {
                  title = term.name || 'Menu Item'
                }
              }
            }
          }

          // Find parent ID in our mapping
          const parentPgId = wpIdToPgIdMap.get(wpItem.menu_item_parent)

          if (parentPgId) {
            await pg.menuItem.create({
              data: {
                menuId: pgMenu.id,
                parentId: parentPgId,
                title,
                url,
                route,
                target,
                cssClass,
                order,
                isActive: true
              }
            })
            itemsImported++
          } else {
            console.log(
              `⚠️  Parent not found for menu item "${wpItem.post_title}" (parent: ${wpItem.menu_item_parent})`
            )
          }
        } catch (error) {
          console.log(
            `⚠️  Skipping child menu item "${wpItem.post_title}":`,
            error instanceof Error ? error.message : error
          )
        }
      }
    } catch (error) {
      console.log(
        `⚠️  Skipping menu "${wpMenu.name}":`,
        error instanceof Error ? error.message : error
      )
    }
  }

  console.log(`🍽️ ${menusImported} Menüs und ${itemsImported} Menu Items importiert`)
}

/**
 * 8) MIGRATE SETTINGS
 */
async function migrateSettings() {
  console.log('⚙️  Migriere WordPress Einstellungen...')

  const importantOptions = [
    'blogname',
    'blogdescription',
    'admin_email',
    'date_format',
    'time_format',
    'start_of_week'
  ]

  let imported = 0
  for (const optionName of importantOptions) {
    try {
      const wpOption = (await mysql.$queryRawUnsafe(`
        SELECT option_value
        FROM ${getTableName('options')}
        WHERE option_name = '${optionName}'
        LIMIT 1
      `)) as any[]

      if (!wpOption || wpOption.length === 0) continue

      if (wpOption[0].option_value === null || wpOption[0].option_value === '') continue

      // Handle different value types
      let value = wpOption[0].option_value

      // Try to parse JSON
      try {
        value = JSON.parse(value)
      } catch {
        // Keep as string if not JSON
      }

      await pg.setting.upsert({
        where: { key: optionName },
        update: { value },
        create: { key: optionName, value }
      })
      imported++
    } catch (error) {
      console.log(`❌ Fehler beim Importieren von Einstellung ${optionName}:`, error)
    }
  }

  console.log(`⚙️  ${imported} Einstellungen importiert`)
}

/**
 * MAIN FUNCTION
 */
async function main() {
  console.log('🚀 WordPress zu PostgreSQL Migration gestartet...')
  console.log(`🏷️  WordPress Prefix: ${config.wpPrefix}`)
  console.log(`🗄️  Sprache: ${config.defaultLanguage}\n`)

  try {
    await clearCMS()
    await migrateUsers()
    await migrateTerms()
    await migrateContent()
    await migrateComments()
    await migrateTermRelationships()
    await migrateMenus()
    await migrateSettings()

    console.log('\n📊 Migration erfolgreich abgeschlossen! ✅')
  } catch (error) {
    console.error('❌ Migrationsfehler:', error)
    process.exit(1)
  } finally {
    await mysql.$disconnect()
    await pg.$disconnect()
  }
}

main().catch(console.error)
