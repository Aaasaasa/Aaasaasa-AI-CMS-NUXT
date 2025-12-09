<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar mit Kategorie-Filter -->
      <aside class="lg:col-span-1">
        <CategoryFilter :selected-category="categorySlug" />
      </aside>

      <!-- Artikel-Liste -->
      <main class="lg:col-span-3">
        <!-- Loading State -->
        <div v-if="pending" class="space-y-4">
          <div class="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
          <div v-for="i in 3" :key="i" class="h-48 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-red-800 mb-2">
            {{ $t('errors.categoryNotFound') }}
          </h2>
          <p class="text-red-600">{{ error.message }}</p>
          <NuxtLink to="/" class="mt-4 inline-block text-primary-600 hover:underline">
            ← {{ $t('navigation.backToHome') }}
          </NuxtLink>
        </div>

        <!-- Content -->
        <div v-else-if="data">
          <!-- Category Header -->
          <header class="mb-8">
            <h1 class="text-4xl font-bold mb-2">{{ data.category.name }}</h1>
            <p v-if="data.category.description" class="text-gray-600 dark:text-gray-400">
              {{ data.category.description }}
            </p>
            <div class="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>{{ data.pagination.total }} {{ $t('articles.count') }}</span>
              <span v-if="data.cached" class="flex items-center gap-1">
                <Icon name="mdi:cached" class="w-4 h-4" />
                {{ $t('cache.fromRedis') }}
              </span>
            </div>
          </header>

          <!-- Articles Grid -->
          <div v-if="data.articles.length > 0" class="space-y-6">
            <article
              v-for="article in data.articles"
              :key="article.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <NuxtLink :to="`/${article.slug}`" class="block">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Featured Image -->
                  <div
                    v-if="article.featuredImage"
                    class="md:col-span-1 aspect-video md:aspect-square"
                  >
                    <img
                      :src="getFeaturedImageUrl(article.featuredImage)"
                      :alt="article.title"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <!-- Content -->
                  <div class="md:col-span-2 p-6">
                    <h2
                      class="text-2xl font-semibold mb-2 hover:text-primary-600 transition-colors"
                    >
                      {{ article.title }}
                    </h2>
                    <p v-if="article.excerpt" class="text-gray-600 dark:text-gray-400 mb-4">
                      {{ article.excerpt }}
                    </p>
                    <time
                      v-if="article.publishedAt"
                      class="text-sm text-gray-500"
                      :datetime="article.publishedAt.toString()"
                    >
                      {{ formatDate(article.publishedAt) }}
                    </time>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <Icon name="mdi:folder-open-outline" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-xl font-semibold text-gray-600 mb-2">
              {{ $t('articles.noArticles') }}
            </h3>
            <p class="text-gray-500">{{ $t('articles.noArticlesInCategory') }}</p>
          </div>

          <!-- Pagination -->
          <nav
            v-if="data.pagination.totalPages > 1"
            class="mt-8 flex justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              v-for="page in data.pagination.totalPages"
              :key="page"
              :class="[
                'px-4 py-2 rounded-lg',
                page === data.pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const categorySlug = computed(() => route.params.slug as string)
const currentPage = computed(() => parseInt((route.query.page as string) || '1'))

// Lade Kategorie-Daten
const { data, pending, error } = await useFetch(`/api/categories/${categorySlug.value}`, {
  query: {
    page: currentPage,
    limit: 10
  },
  watch: [currentPage]
})

// SEO Meta Tags
useHead({
  title: computed(() => data.value?.category.name || t('categories.title')),
  meta: [
    {
      name: 'description',
      content: computed(
        () =>
          data.value?.category.description ||
          t('categories.defaultDescription', { name: data.value?.category.name })
      )
    }
  ]
})

// Helper Functions
function getFeaturedImageUrl(featuredImage: any): string {
  if (typeof featuredImage === 'string') {
    return featuredImage.startsWith('http') ? featuredImage : featuredImage
  }
  return featuredImage?.url || '/images/placeholder.jpg'
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

function goToPage(page: number) {
  router.push({
    query: { ...route.query, page: page > 1 ? page.toString() : undefined }
  })
}
</script>
