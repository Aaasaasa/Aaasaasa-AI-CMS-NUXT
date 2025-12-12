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
        where: { slug: name }
      })

      if (!menu) return null

      // Parse items from JSONB
      const items = Array.isArray(menu.items)
        ? menu.items as MenuItemWithChildren[]
        : []

      return {
        id: menu.id,
        name: menu.name,
        location: name,
        isActive: true,
        items
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
      const menus = await prisma.menu.findMany()

      return menus.map((menu) => {
        // Parse items from JSONB
        const items = Array.isArray(menu.items)
          ? menu.items as MenuItemWithChildren[]
          : []

        return {
          id: menu.id,
          name: menu.name,
          location: menu.slug,
          isActive: true,
          items
        }
      })
    } catch (error) {
      throw new Error(`Failed to fetch menus: ${error}`)
    }
  }
}
