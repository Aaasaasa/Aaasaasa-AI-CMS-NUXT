// shared/i18n/config.ts
// Return a plain i18n config object instead of using defineI18nConfig which expects a different signature.
export function createI18nConfig(messages: any) {
  return {
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages
  }
}
