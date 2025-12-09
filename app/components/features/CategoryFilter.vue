<template>
  <div class="category-filter">
    <h3 class="text-lg font-semibold mb-4">{{ $t('categories.title') }}</h3>

    <!-- Loading State -->
    <div v-if="loadingCategories" class="flex flex-wrap gap-2">
      <div v-for="i in 5" :key="i" class="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
    </div>

    <!-- Categories List -->
    <ul v-else class="flex flex-wrap gap-2">
      <!-- All Articles Link -->
      <li>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
          :class="{ 'bg-primary-100 dark:bg-primary-900': !selectedCategory }"
        >
          <span class="font-medium">{{ $t('categories.all') }}</span>
        </NuxtLink>
      </li>

      <!-- Category Links -->
      <li v-for="category in sortedCategories" :key="category.id">
        <NuxtLink
          :to="`/category/${category.slug}`"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
          :class="{
            'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300':
              selectedCategory === category.slug
          }"
        >
          <span>{{ category.name }}</span>
          <span
            v-if="category.articleCount > 0"
            class="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            {{ category.articleCount }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <!-- Cache Info (nur in Development) -->
    <div v-if="isDev && cachedTimestamp" class="mt-4 text-xs text-gray-500">
      <div class="flex items-center gap-2">
        <Icon name="mdi:cached" class="w-4 h-4" />
        <span>{{ $t('categories.cached') }}: {{ formattedCacheTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedCategory?: string
}>()

const { categories, loadingCategories, loadCategories } = useCategories()
const config = useRuntimeConfig()

// Lade Kategorien beim Mount
onMounted(() => {
  loadCategories()
})

// Sortiere Kategorien nach Artikel-Anzahl
const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => {
    // Erst nach Artikel-Anzahl
    if (b.articleCount !== a.articleCount) {
      return b.articleCount - a.articleCount
    }
    // Dann alphabetisch
    return a.name.localeCompare(b.name)
  })
})

// Cache Timestamp
const cachedTimestamp = ref<string | null>(null)
const isDev = computed(() => config.public.NODE_ENV === 'development')

const formattedCacheTime = computed(() => {
  if (!cachedTimestamp.value) return ''
  return new Date(cachedTimestamp.value).toLocaleTimeString()
})
</script>

<style scoped>
.category-filter {
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
}

:global(.dark) .category-filter {
  background: rgb(17 24 39);
}
</style>
