/**
 * Composable for CMS Menu API integration
 * Provides menu loading functionality with caching and error handling
 */

export interface MenuItem {
  id: number
  title: string
  url: string | null
  route: string | null
  target: string
  cssClass: string | null
  icon: string | null
  order: number
  isActive: boolean
  parentId: number | null
  children?: MenuItem[]
}

export interface MenuResponse {
  success: boolean
  data: {
    id: number
    name: string
    location: string
    isActive: boolean
    items: MenuItem[]
  }
}

export interface SidebarItem {
  label: string
  href: string
  icon: string
  badge?: string
  children?: SidebarItem[]
}

/**
 * Get appropriate icon based on menu title
 */
export const getMenuIcon = (title: string): string => {
  const titleLower = title.toLowerCase()

  if (titleLower.includes('home') || titleLower.includes('start')) return 'i-lucide-home'
  if (titleLower.includes('blog') || titleLower.includes('news')) return 'i-lucide-book-open'
  if (
    titleLower.includes('portfolio') ||
    titleLower.includes('work') ||
    titleLower.includes('projects')
  )
    return 'i-lucide-briefcase'
  if (titleLower.includes('service') || titleLower.includes('dienst')) return 'i-lucide-wrench'
  if (titleLower.includes('about') || titleLower.includes('über') || titleLower.includes('vision'))
    return 'i-lucide-user'
  if (titleLower.includes('contact') || titleLower.includes('kontakt')) return 'i-lucide-mail'
  if (titleLower.includes('technolog')) return 'i-lucide-cpu'
  if (titleLower.includes('impressum')) return 'i-lucide-info'
  if (titleLower.includes('datenschutz') || titleLower.includes('privacy'))
    return 'i-lucide-shield-check'

  return 'i-lucide-chevron-right'
}

/**
 * Convert CMS menu items to sidebar format
 */
export const convertMenuItemToSidebar = (item: MenuItem): SidebarItem => {
  const localePath = useLocalePath()
  const href = item.route || item.url || '#'

  return {
    label: item.title,
    href: href.startsWith('/') ? localePath(href) : href, // Only use localePath for internal routes
    icon: getMenuIcon(item.title),
    children: item.children?.map(convertMenuItemToSidebar)
  }
}

/**
 * Main menu composable
 */
export const useMenu = () => {
  const menuCache = ref<Record<string, MenuResponse>>({})

  /**
   * Fetch a specific menu by name
   */
  const fetchMenu = async (menuName: string): Promise<MenuResponse | null> => {
    // Return cached result if available
    if (menuCache.value[menuName]) {
      return menuCache.value[menuName]
    }

    try {
      const response = await $fetch<MenuResponse>(`/api/menus/${menuName}`)

      if (response.success && response.data) {
        menuCache.value[menuName] = response
        return response
      }

      return null
    } catch {
      // Silent error handling - return null for graceful fallback
      return null
    }
  }

  /**
   * Get all available menus
   */
  const fetchAllMenus = async (): Promise<MenuResponse[]> => {
    try {
      const response = await $fetch<{ success: boolean; data: MenuResponse['data'][] }>(
        '/api/menus'
      )

      if (response.success && response.data) {
        return response.data.map((menu) => ({ success: true, data: menu }))
      }

      return []
    } catch {
      // Silent error handling - return empty array for graceful fallback
      return []
    }
  }

  /**
   * Get sidebar items from a menu
   */
  const getMenuAsSidebarItems = async (menuName: string): Promise<SidebarItem[]> => {
    const menu = await fetchMenu(menuName)

    if (!menu?.data?.items) {
      return []
    }

    return menu.data.items.map(convertMenuItemToSidebar)
  }

  /**
   * Clear menu cache
   */
  const clearMenuCache = () => {
    menuCache.value = {}
  }

  return {
    fetchMenu,
    fetchAllMenus,
    getMenuAsSidebarItems,
    clearMenuCache,
    menuCache: readonly(menuCache)
  }
}

/**
 * Reactive menu loader for components
 */
export const useMenuLoader = (menuName: string) => {
  const { fetchMenu } = useMenu()

  const menuData = ref<MenuResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadMenu = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await fetchMenu(menuName)
      menuData.value = result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load menu'
      // Error logged to reactive error ref for component handling
    } finally {
      loading.value = false
    }
  }

  // Load menu on creation
  onMounted(() => {
    loadMenu()
  })

  return {
    menuData: readonly(menuData),
    loading: readonly(loading),
    error: readonly(error),
    reload: loadMenu
  }
}
