/* eslint-disable no-console */
import { PrismaClient } from './generated/postgres-cms'

const prisma = new PrismaClient({
  datasources: {
    pgCMSdb: {
      url:
        process.env.POSTGRES_CMS_URL ||
        'postgresql://postgres:postgres@localhost:5432/postgres'
    }
  }
})

async function seedMenus() {
  console.log('🍽️ Seeding Menu data...')

  try {
    // Create main sidebar menu
    const sidebarMenu = await prisma.menu.create({
      data: {
        name: 'sidebar',
        location: 'sidebar',
        isActive: true
      }
    })

    // Create menu items
    const menuItems = [
      {
        title: 'Dashboard',
        route: '/',
        icon: 'home',
        order: 1,
        target: '_self',
        isActive: true,
        menuId: sidebarMenu.id
      },
      {
        title: 'Articles',
        route: '/articles',
        icon: 'file-text',
        order: 2,
        target: '_self',
        isActive: true,
        menuId: sidebarMenu.id
      },
      {
        title: 'Pages',
        route: '/pages',
        icon: 'file',
        order: 3,
        target: '_self',
        isActive: true,
        menuId: sidebarMenu.id
      },
      {
        title: 'Portfolio',
        route: '/portfolio',
        icon: 'briefcase',
        order: 4,
        target: '_self',
        isActive: true,
        menuId: sidebarMenu.id
      },
      {
        title: 'About',
        route: '/about',
        icon: 'info',
        order: 5,
        target: '_self',
        isActive: true,
        menuId: sidebarMenu.id
      },
      {
        title: 'Contact',
        route: '/contact',
        icon: 'mail',
        order: 6,
        target: '_self',
        isActive: true,
        menuId: sidebarMenu.id
      }
    ]

    // Insert menu items
    for (const item of menuItems) {
      await prisma.menuItem.create({
        data: item
      })
    }

    // Create footer menu
    const footerMenu = await prisma.menu.create({
      data: {
        name: 'footer',
        location: 'footer',
        isActive: true
      }
    })

    const footerItems = [
      {
        title: 'Privacy Policy',
        route: '/privacy',
        order: 1,
        target: '_self',
        isActive: true,
        menuId: footerMenu.id
      },
      {
        title: 'Terms of Service',
        route: '/terms',
        order: 2,
        target: '_self',
        isActive: true,
        menuId: footerMenu.id
      },
      {
        title: 'Cookie Policy',
        route: '/cookies',
        order: 3,
        target: '_self',
        isActive: true,
        menuId: footerMenu.id
      }
    ]

    for (const item of footerItems) {
      await prisma.menuItem.create({
        data: item
      })
    }

    console.log('✅ Menu data seeded successfully!')
    console.log(`📋 Created sidebar menu with ${menuItems.length} items`)
    console.log(`📋 Created footer menu with ${footerItems.length} items`)
  } catch (error) {
    console.error('❌ Error seeding menu data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
seedMenus()

export { seedMenus }
