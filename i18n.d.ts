// i18n.d.ts
import '@nuxtjs/i18n'

declare module '@nuxtjs/i18n' {
  // erweitere die erlaubten Codes
  export type LocaleCodes = 'en' | 'fr' | 'de' | 'sr' | 'ru' | 'es' | 'it'
}
