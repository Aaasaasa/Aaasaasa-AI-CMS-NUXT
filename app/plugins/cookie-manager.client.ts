// app/plugins/cookie-manager.client.ts
export default defineNuxtPlugin(() => {
  // Auto-initialize cookie manager on client
  if (import.meta.client) {
    // Initialize asynchronously to avoid blocking
    nextTick(async () => {
      try {
        const cookieManager = useCookieManager()
        await cookieManager.initialize()
      } catch {
        // Fail silently if cookie manager can't initialize
      }
    })
  }
})
