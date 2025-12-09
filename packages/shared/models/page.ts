// shared/models/page.ts (optional)
export interface Page {
  id: number
  slug: string
  title: string
  content: string

  // SEO
  seoTitle: string
  seoDescription: string
  seoKeywords?: string
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean

  createdAt: Date
  updatedAt: Date
}
