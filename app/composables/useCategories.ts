// composables/useCategories.ts
// Composable für Kategorie-Verwaltung mit Redis Caching

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  articleCount: number
}

export interface CategoryWithArticles {
  category: {
    id: number
    name: string
    slug: string
    description: string | null
  }
  articles: Array<{
    id: number
    slug: string
    title: string
    excerpt: string
    publishedAt: Date | null
    featuredImage: any
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  cached: boolean
  timestamp: string
}

export function useCategories() {
  const { locale } = useI18n()

  /**
   * Lade alle Kategorien mit Artikel-Anzahl
   */
  const fetchCategories = async (options?: { includeCount?: boolean }) => {
    const { data, error } = await useFetch<{
      data: Category[]
      cached: boolean
      timestamp: string
    }>('/api/categories', {
      query: {
        lang: locale.value,
        count: options?.includeCount !== false
      }
    })

    if (error.value) {
      throw error.value
    }

    return data.value
  }

  /**
   * Lade Artikel einer bestimmten Kategorie
   */
  const fetchCategoryArticles = async (
    slug: string,
    options?: {
      page?: number
      limit?: number
    }
  ) => {
    const { data, error } = await useFetch<CategoryWithArticles>(`/api/categories/${slug}`, {
      query: {
        lang: locale.value,
        page: options?.page || 1,
        limit: options?.limit || 10
      }
    })

    if (error.value) {
      throw error.value
    }

    return data.value
  }

  /**
   * Reactive State für Kategorien-Liste
   */
  const categories = useState<Category[]>('categories', () => [])
  const loadingCategories = useState('loadingCategories', () => false)

  /**
   * Lade Kategorien wenn noch nicht geladen
   */
  const loadCategories = async () => {
    if (categories.value.length > 0) return categories.value

    loadingCategories.value = true
    try {
      const result = await fetchCategories()
      categories.value = result?.data || []
      return categories.value
    } finally {
      loadingCategories.value = false
    }
  }

  /**
   * Finde Kategorie nach Slug
   */
  const getCategoryBySlug = (slug: string) => {
    return categories.value.find((cat) => cat.slug === slug)
  }

  return {
    categories,
    loadingCategories,
    fetchCategories,
    fetchCategoryArticles,
    loadCategories,
    getCategoryBySlug
  }
}
