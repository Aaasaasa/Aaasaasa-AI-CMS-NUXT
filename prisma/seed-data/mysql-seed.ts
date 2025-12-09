// prisma/seed-data/mysql-seed.ts
// MySQL WordPress Integration Seed Data

import { getMySQLClient } from '../../server/lib/prisma-utils'

async function seedMySQLWordPress() {
  const prisma = await getMySQLClient()

  if (!prisma) {
    throw new Error('MySQL client not available')
  }

  try {
    // Clean existing data (in development only)
    if (process.env.NODE_ENV !== 'production') {
      await prisma.wp_term_relationships.deleteMany()
      await prisma.wp_term_taxonomy.deleteMany()
      await prisma.wp_terms.deleteMany()
      await prisma.wp_comments.deleteMany()
      await prisma.wp_postmeta.deleteMany()
      await prisma.wp_posts.deleteMany()
      await prisma.wp_usermeta.deleteMany()
      await prisma.wp_users.deleteMany()
      await prisma.wp_options.deleteMany()
    }

    // Create WordPress admin user
    const _adminUser = await prisma.wp_users.create({
      data: {
        user_login: 'admin',
        user_pass: '$P$B12CjbECL1nQJK.zIlQZgQ4mHI/+I71', // WordPress hash for 'password'
        user_nicename: 'admin',
        user_email: 'admin@nuxtwo.com',
        user_registered: new Date(),
        user_status: 0,
        display_name: 'Administrator'
      }
    })

    // Create WordPress author
    const wpAuthor = await prisma.wp_users.create({
      data: {
        user_login: 'aleksandar',
        user_pass: '$P$B12CjbECL1nQJK.zIlQZgQ4mHI/+I71', // WordPress hash for 'password'
        user_nicename: 'aleksandar-stajic',
        user_email: 'aleksandar@stajic.com',
        user_registered: new Date(),
        user_status: 0,
        display_name: 'Aleksandar Stajic'
      }
    })

    // Create WordPress categories
    const techTerm = await prisma.wp_terms.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        term_group: 0
      }
    })

    const webDevTerm = await prisma.wp_terms.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
        term_group: 0
      }
    })

    const nuxtTerm = await prisma.wp_terms.create({
      data: {
        name: 'Nuxt.js',
        slug: 'nuxt-js',
        term_group: 0
      }
    })

    // Create term taxonomies
    const techCategory = await prisma.wp_term_taxonomy.create({
      data: {
        term_id: techTerm.term_id,
        taxonomy: 'category',
        description: 'Technology and programming articles',
        parent: 0,
        count: 0
      }
    })

    const _webDevCategory = await prisma.wp_term_taxonomy.create({
      data: {
        term_id: webDevTerm.term_id,
        taxonomy: 'category',
        description: 'Web development tutorials and guides',
        parent: techCategory.term_taxonomy_id,
        count: 0
      }
    })

    const _nuxtTag = await prisma.wp_term_taxonomy.create({
      data: {
        term_id: nuxtTerm.term_id,
        taxonomy: 'post_tag',
        description: 'Nuxt.js framework related content',
        parent: 0,
        count: 0
      }
    })

    // Create WordPress posts
    const _post1 = await prisma.wp_posts.create({
      data: {
        post_author: wpAuthor.ID,
        post_date: new Date(),
        post_date_gmt: new Date(),
        post_content: `<!-- wp:heading -->
<h2>Welcome to NuxtWP Multilang Theme</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is a modern, multilingual WordPress-inspired theme built with <strong>Nuxt 4</strong>. Features include:</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Key Features</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><strong>Nuxt 4.1.3</strong> with Vue 3 Composition API</li>
<li><strong>Multi-Database Architecture</strong> (PostgreSQL, MySQL, MongoDB)</li>
<li><strong>Modern Layout System</strong> with AppSidebar and AppFooter</li>
<li><strong>7 Language Support</strong> with smart detection</li>
<li><strong>WordPress Integration</strong> via MySQL database</li>
<li><strong>Advanced Security</strong> with production-ready headers</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Created by Aleksandar Stajic</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This theme represents the pinnacle of modern web development, combining the best of Nuxt.js with WordPress-like content management capabilities.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Built with ❤️ using modern technologies and best practices.</p>
<!-- /wp:paragraph -->`,
        post_title: 'Welcome to NuxtWP Multilang Theme',
        post_excerpt:
          'Introduction to the NuxtWP Multilang Theme - a modern multilingual CMS built with Nuxt 4.',
        post_status: 'publish',
        comment_status: 'open',
        ping_status: 'open',
        post_password: '',
        post_name: 'welcome-to-nuxtwo-multilang-theme',
        to_ping: '',
        pinged: '',
        post_modified: new Date(),
        post_modified_gmt: new Date(),
        post_content_filtered: '',
        post_parent: 0,
        guid: 'http://localhost/?p=1',
        menu_order: 0,
        post_type: 'post',
        post_mime_type: '',
        comment_count: 0
      }
    })

    const _post2 = await prisma.wp_posts.create({
      data: {
        post_author: wpAuthor.ID,
        post_date: new Date(),
        post_date_gmt: new Date(),
        post_content: `<!-- wp:heading -->
<h2>Multi-Database Architecture in NuxtWP</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The NuxtWP theme uses a sophisticated multi-database architecture:</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Database Responsibilities</h3>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4>PostgreSQL (Primary CMS)</h4>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li>Content management (articles, pages, portfolios)</li>
<li>User management and authentication</li>
<li>Media library and SEO data</li>
<li>Site configuration and settings</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4>MySQL (WordPress Integration)</h4>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li>WordPress compatibility layer</li>
<li>Legacy content migration</li>
<li>Plugin data support</li>
<li>Theme settings</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4>MongoDB (Analytics)</h4>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li>User behavior tracking</li>
<li>Performance metrics</li>
<li>Error logging</li>
<li>Search analytics</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>This architecture provides optimal performance and scalability while maintaining WordPress compatibility.</p>
<!-- /wp:paragraph -->`,
        post_title: 'Multi-Database Architecture in NuxtWP',
        post_excerpt: 'Learn about the multi-database architecture powering NuxtWP theme.',
        post_status: 'publish',
        comment_status: 'open',
        ping_status: 'open',
        post_password: '',
        post_name: 'multi-database-architecture-nuxtwo',
        to_ping: '',
        pinged: '',
        post_modified: new Date(),
        post_modified_gmt: new Date(),
        post_content_filtered: '',
        post_parent: 0,
        guid: 'http://localhost/?p=2',
        menu_order: 0,
        post_type: 'post',
        post_mime_type: '',
        comment_count: 0
      }
    })

    // Create About page
    const _aboutPage = await prisma.wp_posts.create({
      data: {
        post_author: wpAuthor.ID,
        post_date: new Date(),
        post_date_gmt: new Date(),
        post_content: `<!-- wp:heading -->
<h2>About NuxtWP Multilang Theme</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Created by <strong>Aleksandar Stajic</strong>, the NuxtWP Multilang Theme represents the next generation of web development frameworks.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Vision</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>To bridge the gap between modern JavaScript frameworks and traditional content management systems, providing developers with powerful tools while maintaining user-friendly content management.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Technology Stack</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li>Nuxt 4.1.3 with TypeScript</li>
<li>Multi-database architecture</li>
<li>Advanced internationalization</li>
<li>Modern security practices</li>
<li>Performance optimization</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Contact</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For inquiries about the theme, please visit our GitHub repository or contact the development team.</p>
<!-- /wp:paragraph -->`,
        post_title: 'About NuxtWP Multilang Theme',
        post_excerpt: 'Learn about the vision and technology behind NuxtWP Multilang Theme.',
        post_status: 'publish',
        comment_status: 'closed',
        ping_status: 'closed',
        post_password: '',
        post_name: 'about',
        to_ping: '',
        pinged: '',
        post_modified: new Date(),
        post_modified_gmt: new Date(),
        post_content_filtered: '',
        post_parent: 0,
        guid: 'http://localhost/?page_id=3',
        menu_order: 0,
        post_type: 'page',
        post_mime_type: '',
        comment_count: 0
      }
    })

    // Create WordPress options
    await prisma.wp_options.createMany({
      data: [
        { option_name: 'siteurl', option_value: 'http://localhost', autoload: 'yes' },
        { option_name: 'home', option_value: 'http://localhost', autoload: 'yes' },
        { option_name: 'blogname', option_value: 'NuxtWP Multilang Theme', autoload: 'yes' },
        {
          option_name: 'blogdescription',
          option_value: 'Modern multilingual WordPress-inspired theme',
          autoload: 'yes'
        },
        { option_name: 'admin_email', option_value: 'admin@nuxtwo.com', autoload: 'yes' },
        { option_name: 'default_role', option_value: 'subscriber', autoload: 'yes' },
        { option_name: 'template', option_value: 'nuxtwo-theme', autoload: 'yes' },
        { option_name: 'stylesheet', option_value: 'nuxtwo-theme', autoload: 'yes' },
        { option_name: 'date_format', option_value: 'F j, Y', autoload: 'yes' },
        { option_name: 'time_format', option_value: 'g:i a', autoload: 'yes' },
        { option_name: 'start_of_week', option_value: '1', autoload: 'yes' },
        { option_name: 'WPLANG', option_value: '', autoload: 'yes' },
        { option_name: 'theme_version', option_value: '1.0.0', autoload: 'yes' },
        { option_name: 'theme_author', option_value: 'Aleksandar Stajic', autoload: 'yes' }
      ]
    })

    // Log successful seeding
    process.stdout.write('MySQL WordPress seeded successfully!\n')
    process.stdout.write('Created:\n')
    process.stdout.write('- 2 WordPress users (admin, aleksandar)\n')
    process.stdout.write('- 3 terms with taxonomies\n')
    process.stdout.write('- 2 WordPress posts\n')
    process.stdout.write('- 1 WordPress page\n')
    process.stdout.write('- 14 WordPress options\n')
  } catch (error) {
    process.stderr.write(`Error seeding MySQL: ${error}\n`)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedMySQLWordPress().catch((error) => {
    process.stderr.write(`Seed failed: ${error}\n`)
    process.exit(1)
  })
}

export default seedMySQLWordPress
