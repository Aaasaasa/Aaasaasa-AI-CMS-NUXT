import prismaCms from '../utils/prismaCms'

const prisma = prismaCms

export interface MenuItemWithChildren {
  id: number
  title: string
  url?: string
  route?: string
  target: string
  cssClass?: string
  icon?: string
  order: number
  isActive: boolean
  children?: MenuItemWithChildren[]
}

export interface MenuWithItems {
  id: number
  name: string
  location: string
  isActive: boolean
  items: MenuItemWithChildren[]
}

export const MenuService = {
  /**
   * Get menu by name with all items
   */
  async getMenuByName(name: string): Promise<MenuWithItems | null> {
    try {
      const menu = await prisma.menu.findUnique({
        where: { name, isActive: true },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              page: {
                include: {
                  translations: {
                    where: { lang: 'de' },
                    take: 1
                  }
                }
              },
              article: {
                include: {
                  translations: {
                    where: { lang: 'de' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      })

      if (!menu) return null

      // Filter root items and build hierarchy
      const rootItems = menu.items.filter((item: any) => !item.parentId)
      const menuItems = this.buildMenuHierarchy(rootItems, menu.items)

      return {
        id: menu.id,
        name: menu.name,
        location: menu.location,
        isActive: menu.isActive,
        items: menuItems
      }
    } catch (error) {
      throw new Error(`Failed to fetch menu: ${error}`)
    }
  },

  /**
   * Get all active menus
   */
  async getAllMenus(): Promise<MenuWithItems[]> {
    try {
      const menus = await prisma.menu.findMany({
        where: { isActive: true },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          }
        }
      })

      return menus.map((menu: any) => {
        const rootItems = menu.items.filter((item: any) => !item.parentId)
        const menuItems = this.buildMenuHierarchy(rootItems, menu.items)

        return {
          id: menu.id,
          name: menu.name,
          location: menu.location,
          isActive: menu.isActive,
          items: menuItems
        }
      })
    } catch (error) {
      throw new Error(`Failed to fetch menus: ${error}`)
    }
  },

  /**
   * Build hierarchical menu structure
   */
  buildMenuHierarchy(rootItems: any[], allItems: any[]): MenuItemWithChildren[] {
    return rootItems.map((item: any) => {
      const children = allItems.filter((child: any) => child.parentId === item.id)

      // Build URL from page/article if not set
      let url = item.url || ''
      if (!url && item.page?.translations?.[0]?.slug) {
        url = `/${item.page.translations[0].slug}`
      } else if (!url && item.article?.translations?.[0]?.slug) {
        url = `/blog/${item.article.translations[0].slug}`
      }

      return {
        id: item.id,
        title: item.title,
        url: url || item.route,
        route: item.route,
        target: item.target,
        cssClass: item.cssClass,
        icon: item.icon,
        order: item.order,
        isActive: item.isActive,
        children: children.length > 0 ? this.buildMenuHierarchy(children, allItems) : undefined
      }
    })
  },

  /**
   * Get menu item URL
   */
  getMenuItemUrl(item: MenuItemWithChildren): string {
    if (item.url) return item.url
    if (item.route) return item.route
    return '#'
  }
}
