/**
 * UI preferences types
 */
export type PostViewMode = 'list' | 'grid'
export type PostDisplayMode = 'compact' | 'extended'
export interface Preferences {
  locale: string
  theme: 'light' | 'dark'
}
