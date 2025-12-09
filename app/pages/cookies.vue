<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Cookie-Einstellungen
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Verwalten Sie Ihre Cookie-Einstellungen und erfahren Sie mehr über die verwendeten
          Cookies.
        </p>
      </header>

      <!-- Current Settings Overview -->
      <div v-if="consent" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Aktuelle Einstellungen
          </h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Zuletzt geändert: {{ formatDate(consent.timestamp) }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(accepted, category) in consent.categories"
            :key="category"
            class="text-center p-3 rounded-lg"
            :class="
              accepted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            "
          >
            <Icon
              :name="accepted ? 'i-lucide-check' : 'i-lucide-x'"
              :class="
                accepted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              "
              class="w-5 h-5 mx-auto mb-2"
            />
            <div class="text-sm font-medium capitalize">{{ category }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ accepted ? 'Aktiviert' : 'Deaktiviert' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cookie Categories -->
      <div class="space-y-6">
        <div
          v-for="category in cookieCategories"
          :key="category.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          <div class="p-6">
            <!-- Category Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <Icon
                  :name="getCategoryIcon(category.key)"
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
                />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ category.name }}
                  </h3>
                  <p v-if="category.description" class="text-sm text-gray-600 dark:text-gray-400">
                    {{ category.description }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span
                  v-if="category.required"
                  class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded"
                >
                  Erforderlich
                </span>

                <!-- Toggle Switch -->
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="selectedCategories[category.key]"
                    type="checkbox"
                    :disabled="category.required"
                    class="sr-only peer"
                    @change="updateCategory(category.key, $event)"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"
                  ></div>
                </label>
              </div>
            </div>

            <!-- Cookies in this category -->
            <div v-if="category.cookies.length" class="border-t dark:border-gray-700 pt-4">
              <details class="group">
                <summary
                  class="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span>{{ category.cookies.length }} Cookie(s) in dieser Kategorie</span>
                  <Icon
                    name="i-lucide-chevron-down"
                    class="w-4 h-4 transition-transform group-open:rotate-180"
                  />
                </summary>

                <div class="mt-4 space-y-4">
                  <div
                    v-for="cookie in category.cookies"
                    :key="cookie.id"
                    class="border dark:border-gray-700 rounded-lg p-4"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium text-gray-900 dark:text-white">{{ cookie.name }}</h4>
                      <span
                        class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {{ cookie.duration || 'Session' }}
                      </span>
                    </div>

                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {{ cookie.purpose }}
                    </p>

                    <div class="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <div v-if="cookie.provider">
                        <strong>Anbieter:</strong> {{ cookie.provider }}
                      </div>
                      <div v-if="cookie.domain"><strong>Domain:</strong> {{ cookie.domain }}</div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          @click="acceptAll"
        >
          Alle akzeptieren
        </button>

        <button
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          @click="rejectAll"
        >
          Nur erforderliche
        </button>

        <button
          class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          @click="saveSettings"
        >
          Einstellungen speichern
        </button>
      </div>

      <!-- Cookie Policy -->
      <div v-if="cookiePolicy" class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cookie-Richtlinie</h2>
        <div class="prose dark:prose-invert max-w-none text-sm">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="cookiePolicy.content"></div>
        </div>

        <div class="mt-6 pt-4 border-t dark:border-gray-700">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Version {{ cookiePolicy.version }} • Gültig ab {{ formatDate(cookiePolicy.validFrom) }}
          </div>
        </div>
      </div>

      <!-- Back Link -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <Icon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Zurück zur Startseite
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cookieManager = useCookieManager()
const { locale } = useI18n()

// State
const selectedCategories = ref<Record<string, boolean>>({})

// Computed
const consent = computed(() => cookieManager.consent.value)
const cookiePolicy = computed(() => cookieManager.cookiePolicy.value)
const cookieCategories = computed(() => cookieManager.cookieCategories.value)

// Initialize
onMounted(async () => {
  await cookieManager.initialize()

  // Set initial selected categories
  if (consent.value) {
    selectedCategories.value = { ...consent.value.categories }
  } else {
    // Default to required only
    cookieCategories.value.forEach((category: any) => {
      selectedCategories.value[category.key] = category.required
    })
  }
})

// Methods
const getCategoryIcon = (categoryKey: string): string => {
  const icons: Record<string, string> = {
    essential: 'i-lucide-shield-check',
    analytics: 'i-lucide-bar-chart',
    marketing: 'i-lucide-target',
    preferences: 'i-lucide-settings',
    functional: 'i-lucide-zap'
  }
  return icons[categoryKey] || 'i-lucide-cookie'
}

const updateCategory = async (categoryKey: string, event: Event) => {
  const target = event.target as HTMLInputElement
  selectedCategories.value[categoryKey] = target.checked
}

const acceptAll = async () => {
  cookieCategories.value.forEach((category: any) => {
    selectedCategories.value[category.key] = true
  })
  await cookieManager.saveConsent(selectedCategories.value)
}

const rejectAll = async () => {
  cookieCategories.value.forEach((category: any) => {
    selectedCategories.value[category.key] = category.required
  })
  await cookieManager.saveConsent(selectedCategories.value)
}

const saveSettings = async () => {
  await cookieManager.saveConsent(selectedCategories.value)
}

const formatDate = (timestamp: string | number): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// SEO
useSeoMeta({
  title: 'Cookie-Einstellungen',
  description: 'Verwalten Sie Ihre Cookie-Einstellungen und Datenschutzpräferenzen',
  robots: 'noindex, nofollow'
})
</script>
