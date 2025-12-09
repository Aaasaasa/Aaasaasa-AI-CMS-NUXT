// prisma/seed-data/postgres-seed.ts
// PostgreSQL CMS Seed Data for Aaasaasa AI CMS NUXT

import { PrismaClient as PostgresCMSClient } from '../generated/postgres-cms'
import seedRBAC from './rbac-seed'

const prismaCMS = new PostgresCMSClient()

async function seedPostgresCMS() {
  try {
    // ==========================================
    // STEP 1: SEED RBAC SYSTEM FIRST
    // ==========================================
    const _rbacData = await seedRBAC()

    // ==========================================
    // STEP 2: CREATE DEMO USERS
    // ==========================================
    // eslint-disable-next-line no-console
    console.log('👤 Creating Demo Users...')

    // Clean existing data (in development only)
    if (process.env.NODE_ENV !== 'production') {
      await prismaCMS.termRelationship.deleteMany()
      await prismaCMS.termTaxonomy.deleteMany()
      await prismaCMS.term.deleteMany()
      await prismaCMS.comment.deleteMany()
      await prismaCMS.articleTranslation.deleteMany()
      await prismaCMS.article.deleteMany()
      await prismaCMS.pageTranslation.deleteMany()
      await prismaCMS.page.deleteMany()
      await prismaCMS.portfolioTranslation.deleteMany()
      await prismaCMS.portfolio.deleteMany()
      await prismaCMS.productTranslation.deleteMany()
      await prismaCMS.product.deleteMany()
      await prismaCMS.userMeta.deleteMany()
      await prismaCMS.employeeRole.deleteMany()
      await prismaCMS.employee.deleteMany()
      await prismaCMS.user.deleteMany()
      await prismaCMS.setting.deleteMany()
      await prismaCMS.menu.deleteMany()
    }

    // Create admin user
    const _adminUser = await prismaCMS.user.create({
      data: {
        login: 'admin',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        displayName: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPERADMIN',
        emailVerified: true
      }
    })

    // Create demo author user
    const authorUser = await prismaCMS.user.create({
      data: {
        login: 'demo_author',
        email: 'author@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        displayName: 'Demo Author',
        firstName: 'John',
        lastName: 'Smith',
        role: 'AUTHOR',
        emailVerified: true
      }
    })

    // Create demo vendor user
    const _vendorUser = await prismaCMS.user.create({
      data: {
        login: 'demo_vendor',
        email: 'vendor@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        displayName: 'Demo Vendor',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'VENDOR',
        emailVerified: true
      }
    })

    // Create demo customer user
    const _customerUser = await prismaCMS.user.create({
      data: {
        login: 'demo_customer',
        email: 'customer@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        displayName: 'Demo Customer',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'CUSTOMER',
        emailVerified: true
      }
    })

    // Create categories (terms)
    const techTerm = await prismaCMS.term.create({
      data: {
        slug: 'technology',
        name: 'Technology'
      }
    })

    const webDevTerm = await prismaCMS.term.create({
      data: {
        slug: 'web-development',
        name: 'Web Development'
      }
    })

    const nuxtTerm = await prismaCMS.term.create({
      data: {
        slug: 'nuxt',
        name: 'Nuxt.js'
      }
    })

    // Create taxonomies
    const techCategory = await prismaCMS.termTaxonomy.create({
      data: {
        termId: techTerm.id,
        taxonomy: 'category',
        description: 'Technology and programming articles'
      }
    })

    const webDevCategory = await prismaCMS.termTaxonomy.create({
      data: {
        termId: webDevTerm.id,
        taxonomy: 'category',
        description: 'Web development tutorials and guides',
        parentId: techCategory.id
      }
    })

    const nuxtTag = await prismaCMS.termTaxonomy.create({
      data: {
        termId: nuxtTerm.id,
        taxonomy: 'tag',
        description: 'Nuxt.js framework related content'
      }
    })

    // Create sample articles
    const _article1 = await prismaCMS.article.create({
      data: {
        slug: 'welcome-to-aaasaasa-ai-cms-nuxt',
        status: 'PUBLISHED',
        authorId: authorUser.id,
        translations: {
          create: [
            {
              lang: 'en',
              title: 'Welcome to Aaasaasa AI CMS NUXT',
              content: `# Welcome to Aaasaasa AI CMS NUXT

This is a modern, multilingual WordPress-inspired theme built with Nuxt 4. Features include:

## Key Features

- **Nuxt 4.1.3** with Vue 3 Composition API
- **Multi-Database Architecture** (PostgreSQL, MySQL, MongoDB)
- **Modern Layout System** with AppSidebar and AppFooter
- **7 Language Support** with smart detection
- **WordPress Integration** via MySQL database
- **Advanced Security** with production-ready headers

## Created by Aleksandar Stajic

This theme represents the pinnacle of modern web development, combining the best of Nuxt.js with WordPress-like content management capabilities.

Built with ❤️ using modern technologies and best practices.`,
              excerpt:
                'Introduction to the Aaasaasa AI CMS NUXT - a modern multilingual CMS built with Nuxt 4.'
            },
            {
              lang: 'de',
              title: 'Willkommen beim Aaasaasa AI CMS NUXT',
              content: `# Willkommen beim Aaasaasa AI CMS NUXT

Dies ist ein modernes, mehrsprachiges WordPress-inspiriertes Theme, das mit Nuxt 4 entwickelt wurde.

## Hauptfunktionen

- **Nuxt 4.1.3** mit Vue 3 Composition API
- **Multi-Datenbank-Architektur** (PostgreSQL, MySQL, MongoDB)
- **Modernes Layout-System** mit AppSidebar und AppFooter
- **7 Sprachen Unterstützung** mit intelligenter Erkennung
- **WordPress Integration** über MySQL-Datenbank
- **Erweiterte Sicherheit** mit produktionsbereiten Headern

## Erstellt von Aleksandar Stajic

Dieses Theme repräsentiert den Höhepunkt moderner Webentwicklung und kombiniert das Beste von Nuxt.js mit WordPress-ähnlichen Content-Management-Fähigkeiten.`,
              excerpt:
                'Einführung in das Aaasaasa AI CMS NUXT - ein modernes mehrsprachiges CMS mit Nuxt 4.'
            },
            {
              lang: 'sr',
              title: 'Dobrodošli u Aaasaasa AI CMS NUXT',
              content: `# Dobrodošli u Aaasaasa AI CMS NUXT

Ovo je moderna, višejezična tema inspirisana WordPress-om, razvijena sa Nuxt 4.

## Ključne karakteristike

- **Nuxt 4.1.3** sa Vue 3 Composition API
- **Multi-baza arhitektura** (PostgreSQL, MySQL, MongoDB)
- **Moderan layout sistem** sa AppSidebar i AppFooter
- **Podrška za 7 jezika** sa pametnim prepoznavanjem
- **WordPress integracija** preko MySQL baze
- **Napredna bezbednost** sa production-ready header-ima

## Kreirao Aleksandar Stajić

Ova tema predstavlja vrh moderne web razvojačke arhitekture.`,
              excerpt:
                'Uvod u Aaasaasa AI CMS NUXT - moderan višejezični CMS napravljen sa Nuxt 4.'
            }
          ]
        },
        terms: {
          create: [{ termTaxonomyId: techCategory.id }, { termTaxonomyId: nuxtTag.id }]
        }
      }
    })

    const _article2 = await prismaCMS.article.create({
      data: {
        slug: 'multi-database-architecture',
        status: 'PUBLISHED',
        authorId: authorUser.id,
        translations: {
          create: [
            {
              lang: 'en',
              title: 'Multi-Database Architecture in Aaasaasa AI CMS NUXT',
              content: `# Multi-Database Architecture

The Aaasaasa AI CMS NUXT uses a sophisticated multi-database architecture:

## Database Responsibilities

### PostgreSQL (Primary CMS)
- Content management (articles, pages, portfolios)
- User management and authentication
- Media library and SEO data
- Site configuration and settings

### MySQL (WordPress Integration)
- WordPress compatibility layer
- Legacy content migration
- Plugin data support
- Theme settings

### MongoDB (Analytics)
- User behavior tracking
- Performance metrics
- Error logging
- Search analytics

This architecture provides optimal performance and scalability while maintaining WordPress compatibility.`,
              excerpt: 'Learn about the multi-database architecture powering Aaasaasa AI CMS NUXT.'
            },
            {
              lang: 'de',
              title: 'Multi-Datenbank-Architektur in Aaasaasa AI CMS NUXT',
              content: `# Multi-Datenbank-Architektur

Das Aaasaasa AI CMS NUXT verwendet eine ausgeklügelte Multi-Datenbank-Architektur:

## Datenbank-Zuständigkeiten

### PostgreSQL (Haupt-CMS)
- Content-Management (Artikel, Seiten, Portfolios)
- Benutzerverwaltung und Authentifizierung
- Medienbibliothek und SEO-Daten
- Site-Konfiguration und Einstellungen

### MySQL (WordPress-Integration)
- WordPress-Kompatibilitätsschicht
- Legacy-Content-Migration
- Plugin-Daten-Unterstützung
- Theme-Einstellungen

### MongoDB (Analytics)
- Benutzerverhalten-Tracking
- Performance-Metriken
- Fehler-Logging
- Such-Analytics

Diese Architektur bietet optimale Performance und Skalierbarkeit bei gleichzeitiger WordPress-Kompatibilität.`,
              excerpt: 'Erfahren Sie mehr über die Multi-Datenbank-Architektur des Aaasaasa AI CMS NUXT.'
            }
          ]
        },
        terms: {
          create: [{ termTaxonomyId: techCategory.id }, { termTaxonomyId: webDevCategory.id }]
        }
      }
    })

    // Create sample pages
    const _aboutPage = await prismaCMS.page.create({
      data: {
        slug: 'about',
        status: 'PUBLISHED',
        authorId: authorUser.id,
        translations: {
          create: [
            {
              lang: 'en',
              title: 'About Aaasaasa AI CMS NUXT',
              content: `# About Aaasaasa AI CMS NUXT

Created by **Aleksandar Stajic**, the Aaasaasa AI CMS NUXT represents the next generation of web development frameworks.

## Vision

To bridge the gap between modern JavaScript frameworks and traditional content management systems, providing developers with powerful tools while maintaining user-friendly content management.

## Technology Stack

- Nuxt 4.1.3 with TypeScript
- Multi-database architecture
- Advanced internationalization
- Modern security practices
- Performance optimization

## Contact

For inquiries about the theme, please visit our GitHub repository or contact the development team.`,
              excerpt: 'Learn about the vision and technology behind Aaasaasa AI CMS NUXT.'
            },
            {
              lang: 'de',
              title: 'Über Aaasaasa AI CMS NUXT',
              content: `# Über Aaasaasa AI CMS NUXT

Erstellt von **Aleksandar Stajic**, repräsentiert das Aaasaasa AI CMS NUXT die nächste Generation von Web-Entwicklungs-Frameworks.

## Vision

Die Lücke zwischen modernen JavaScript-Frameworks und traditionellen Content-Management-Systemen zu schließen und Entwicklern mächtige Tools zu bieten, während benutzerfreundliches Content-Management erhalten bleibt.

## Technologie-Stack

- Nuxt 4.1.3 mit TypeScript
- Multi-Datenbank-Architektur
- Erweiterte Internationalisierung
- Moderne Sicherheitspraktiken
- Performance-Optimierung

## Kontakt

Für Anfragen zum Theme besuchen Sie bitte unser GitHub-Repository oder kontaktieren Sie das Entwicklungsteam.`,
              excerpt:
                'Erfahren Sie mehr über die Vision und Technologie hinter dem Aaasaasa AI CMS NUXT.'
            }
          ]
        }
      }
    })

    // Create sample portfolio items
    const _portfolioItem = await prismaCMS.portfolio.create({
      data: {
        slug: 'nuxtwo-theme-showcase',
        status: 'PUBLISHED',
        authorId: authorUser.id,
        translations: {
          create: [
            {
              lang: 'en',
              title: 'Aaasaasa AI CMS NUXT Showcase',
              content: `# Aaasaasa AI CMS NUXT Portfolio

A comprehensive showcase of the Aaasaasa AI CMS NUXT capabilities:

## Features Demonstrated

- Responsive sidebar navigation
- Multi-language content management
- Modern footer with author attribution
- Advanced database architecture
- Security hardening implementation

## Technologies Used

- Nuxt 4.1.3
- Vue 3 Composition API
- TypeScript ES Modules
- Prisma ORM
- Tailwind CSS
- Docker containerization

## Results

A production-ready, multilingual CMS that combines modern development practices with user-friendly content management.`,
              excerpt: 'Comprehensive showcase of Aaasaasa AI CMS NUXT capabilities and features.'
            }
          ]
        }
      }
    })

    // Create sample product
    const _product = await prismaCMS.product.create({
      data: {
        slug: 'nuxtwo-pro-license',
        price: 99.99,
        currency: 'EUR',
        stock: 1000,
        vendorId: authorUser.id,
        translations: {
          create: [
            {
              lang: 'en',
              title: 'Aaasaasa AI CMS NUXT Pro License',
              description: `Professional license for the Aaasaasa AI CMS NUXT including:

- Commercial use rights
- Premium support
- Advanced documentation
- Custom development consultation
- Priority updates and features`
            },
            {
              lang: 'de',
              title: 'Aaasaasa AI CMS NUXT Pro Lizenz',
              description: `Professionelle Lizenz für das Aaasaasa AI CMS NUXT inklusive:

- Kommerzielle Nutzungsrechte
- Premium Support
- Erweiterte Dokumentation
- Custom Development Beratung
- Prioritäts-Updates und Features`
            }
          ]
        }
      }
    })

    // Create main navigation menu (simplified for now, can be populated via admin)
    await prismaCMS.menu.create({
      data: {
        name: 'main-navigation',
        location: 'header'
      }
    })

    // Create site settings
    await prismaCMS.setting.createMany({
      data: [
        {
          key: 'site_title',
          value: {
            en: 'Aaasaasa AI CMS NUXT',
            de: 'Aaasaasa AI CMS NUXT',
            sr: 'Aaasaasa AI CMS NUXT'
          }
        },
        {
          key: 'site_description',
          value: {
            en: 'Modern multilingual WordPress-inspired theme',
            de: 'Modernes mehrsprachiges WordPress-inspiriertes Theme'
          }
        },
        { key: 'site_author', value: 'Aleksandar Stajic' },
        { key: 'site_version', value: '1.0.0' },
        { key: 'default_language', value: 'en' },
        { key: 'supported_languages', value: ['en', 'de', 'sr', 'es', 'fr', 'it', 'ru'] },
        {
          key: 'theme_settings',
          value: {
            primaryColor: '#3b82f6',
            sidebarWidth: '280px',
            footerStyle: 'modern',
            headerStyle: 'fixed'
          }
        }
      ]
    })

    // Log successful seeding
    process.stdout.write('PostgreSQL CMS seeded successfully!\n')
    process.stdout.write('Created:\n')
    process.stdout.write('- 2 users (admin, aleksandar)\n')
    process.stdout.write('- 3 terms with taxonomies\n')
    process.stdout.write('- 2 articles with translations\n')
    process.stdout.write('- 1 page with translations\n')
    process.stdout.write('- 1 portfolio item\n')
    process.stdout.write('- 1 product\n')
    process.stdout.write('- 1 navigation menu\n')
    process.stdout.write('- 7 site settings\n')
  } catch (error) {
    process.stderr.write(`Error seeding PostgreSQL: ${error}\n`)
    throw error
  } finally {
    await prismaCMS.$disconnect()
  }
}

export default seedPostgresCMS
