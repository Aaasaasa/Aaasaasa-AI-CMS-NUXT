<template>
  <div
    v-if="shouldShow"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-4">
      <h2 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        🍪 Cookie-Einstellungen (DEBUG)
      </h2>

      <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.
      </p>

      <div class="flex flex-col gap-2">
        <button
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          @click="acceptAll"
        >
          Alle akzeptieren
        </button>

        <button
          class="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
          @click="rejectAll"
        >
          Nur erforderliche
        </button>

        <button
          class="w-full bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          @click="closeBanner"
        >
          Schließen (Test)
        </button>
      </div>

      <!-- Debug Info -->
      <details class="mt-4" open>
        <summary class="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
        <pre class="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-2 overflow-auto max-h-40">{{
          debugData
        }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup>
const debugData = ref({})
const cookieManager = useCookieManager()
const showDebugBanner = ref(true)

const updateDebug = () => {
  if (import.meta.client) {
    debugData.value = {
      timestamp: new Date().toLocaleTimeString(),
      showBanner: cookieManager.showBanner.value,
      consent: cookieManager.consent.value,
      localStorage_content: localStorage.getItem('cookie-consent'),
      localStorage_dismissed: localStorage.getItem('cookie-banner-dismissed'),
      categories_count: cookieManager.cookieCategories.value.length,
      categories_keys: cookieManager.cookieCategories.value.map((c) => c.key),
      isLoaded: cookieManager.isLoaded.value
    }
  }
}

const acceptAll = async () => {
  debugData.value = { ...debugData.value, action: 'acceptAll-start', startTime: Date.now() }

  try {
    await cookieManager.acceptAll()
    debugData.value = { ...debugData.value, action: 'acceptAll-success', endTime: Date.now() }
    updateDebug()
  } catch (error) {
    debugData.value = { ...debugData.value, action: 'acceptAll-error', error: String(error) }
  }
}

const rejectAll = async () => {
  debugData.value = { ...debugData.value, action: 'rejectAll-start', startTime: Date.now() }

  try {
    await cookieManager.rejectAll()
    debugData.value = { ...debugData.value, action: 'rejectAll-success', endTime: Date.now() }
    updateDebug()
  } catch (error) {
    debugData.value = { ...debugData.value, action: 'rejectAll-error', error: String(error) }
  }
}

const closeBanner = () => {
  showDebugBanner.value = false
  cookieManager.dismissBanner()
  updateDebug()
}

// Only show if there are issues or for debugging
const shouldShow = computed(() => {
  return (
    showDebugBanner.value &&
    (!cookieManager.isLoaded.value || cookieManager.showBanner.value || import.meta.dev)
  )
})

onMounted(async () => {
  try {
    await cookieManager.initialize()
    debugData.value = { ...debugData.value, initialization: 'success' }
  } catch (error) {
    debugData.value = { ...debugData.value, initialization: 'error', initError: String(error) }
  }

  updateDebug()

  // Update debug info periodically
  setInterval(updateDebug, 2000)
})
</script>
