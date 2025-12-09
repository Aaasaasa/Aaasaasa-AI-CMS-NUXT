<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div class="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 class="font-bold mb-2">Cookie Test</h3>
      <p class="text-sm mb-4">Test Cookie Banner - funktioniert es?</p>
      <div class="flex gap-2">
        <button
          class="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
          @click="testAccept"
        >
          Akzeptieren
        </button>
        <button class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm" @click="testReject">
          Ablehnen
        </button>
        <button class="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm" @click="testClose">
          Schließen
        </button>
      </div>
      <div v-if="debugInfo" class="mt-2 text-xs bg-black bg-opacity-20 p-2 rounded">
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const debugInfo = ref('')
const cookieManager = useCookieManager()

const updateDebug = () => {
  debugInfo.value = JSON.stringify(
    {
      showBanner: cookieManager.showBanner.value,
      isLoaded: cookieManager.isLoaded.value,
      consent: cookieManager.consent.value ? 'exists' : 'null',
      categories: cookieManager.cookieCategories.value.length,
      policy: cookieManager.cookiePolicy.value ? 'exists' : 'null'
    },
    null,
    2
  )
}

const testAccept = async () => {
  debugInfo.value = 'Calling acceptAll...'
  try {
    await cookieManager.acceptAll()
    updateDebug()
  } catch (error) {
    debugInfo.value = 'Error: ' + error.message
  }
}

const testReject = async () => {
  debugInfo.value = 'Calling rejectAll...'
  try {
    await cookieManager.rejectAll()
    updateDebug()
  } catch (error) {
    debugInfo.value = 'Error: ' + error.message
  }
}

const testClose = () => {
  cookieManager.dismissBanner()
  updateDebug()
}

// Initialize and show debug info
onMounted(async () => {
  try {
    await cookieManager.initialize()
    updateDebug()

    // Auto-update debug info every 2 seconds
    setInterval(updateDebug, 2000)
  } catch (error) {
    debugInfo.value = 'Init Error: ' + error.message
  }
})
</script>
