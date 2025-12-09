<script setup lang="ts">
// Meta tags for SEO
useSeoMeta({
  title: 'Blog - Aaasaasa CMS',
  description: 'Latest articles and blog posts from our multilingual WordPress theme.'
})

// Current locale for multilingual content
const { locale } = useI18n()

// View mode state (grid or list)
const viewMode = ref<'grid' | 'list'>('grid')

// Fetch articles from API using useFetch for proper reactivity
const { data: response, pending, error } = await useFetch('/api/posts')

const displayArticles = computed(() => {
  if (response.value?.data) {
    return Array.isArray(response.value.data) ? response.value.data : []
  }
  return []
})

// Helper functions for multilingual content
const getArticleTitle = (article: any) => {
  if (article.translations?.length) {
    const translation =
      article.translations.find((t: any) => t.lang === locale.value) || article.translations[0]
    return translation?.title || article.title || 'Untitled'
  }
  return article.title || 'Untitled'
}

const getArticleContent = (article: any) => {
  if (article.translations?.length) {
    const translation =
      article.translations.find((t: any) => t.lang === locale.value) || article.translations[0]
    return translation?.content || article.content || ''
  }
  return article.content || ''
}

const getArticleExcerpt = (article: any) => {
  if (article.translations?.length) {
    const translation =
      article.translations.find((t: any) => t.lang === locale.value) || article.translations[0]
    return translation?.excerpt || article.excerpt || ''
  }
  return article.excerpt || ''
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const getTextExcerpt = (htmlContent: string) => {
  if (!htmlContent) return ''

  // Remove HTML tags using regex (SSR-safe)
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove other HTML entities
    .trim()

  // Create excerpt (first 150 characters)
  const excerpt = textContent.substring(0, 150)
  return excerpt + (textContent.length > 150 ? '...' : '')
}
</script>

<template>
  <div class="w-full">
    <div class="container mx-auto px-4 py-8 max-w-[1600px]">
      <!-- Header with Title and View Controls -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              {{ $t('blog.title', 'Blog') }}
            </h1>
            <p class="text-gray-600 text-lg">
              {{ $t('blog.description', 'Discover our latest articles and insights') }}
            </p>
          </div>

          <!-- View Mode Toggle -->
          <div
            class="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200"
          >
            <button
              :class="[
                'px-4 py-2 rounded-md transition-colors flex items-center gap-2',
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              ]"
              @click="viewMode = 'grid'"
            >
              <Icon name="i-lucide-grid-3x3" class="w-4 h-4" />
              <span class="hidden sm:inline">Grid</span>
            </button>
            <button
              :class="[
                'px-4 py-2 rounded-md transition-colors flex items-center gap-2',
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              ]"
              @click="viewMode = 'list'"
            >
              <Icon name="i-lucide-list" class="w-4 h-4" />
              <span class="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Category Filter (Above Content) -->
      <div class="mb-6">
        <CategoryFilter />
      </div>

      <!-- Main Content Area -->
      <!-- Loading State -->
      <div
        v-if="pending"
        :class="
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'
        "
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div class="h-48 bg-gray-300"></div>
          <div class="p-6">
            <div class="h-6 bg-gray-300 rounded mb-4"></div>
            <div class="h-4 bg-gray-300 rounded mb-2"></div>
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
          <h3 class="text-lg font-semibold text-red-800 mb-2">
            {{ $t('blog.error.title', 'Failed to load articles') }}
          </h3>
          <p class="text-red-600">
            {{ $t('blog.error.message', 'Please try again later') }}
          </p>
          <button
            class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            @click="$router.go(0)"
          >
            {{ $t('blog.error.retry', 'Retry') }}
          </button>
        </div>
      </div>

      <!-- Articles Grid/List View -->
      <div
        v-else-if="displayArticles.length > 0"
        :class="
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'
        "
      >
        <article
          v-for="article in displayArticles"
          :key="article.id"
          :class="
            viewMode === 'grid'
              ? 'article-card flex flex-col h-full'
              : 'article-card-list flex flex-row gap-6 bg-white rounded-lg shadow-md overflow-hidden'
          "
        >
          <!-- Article Image (Clickable) -->
          <NuxtLink
            :to="`/blog/${article.slug || article.id}`"
            :class="viewMode === 'grid' ? 'article-card-image' : 'w-1/3 shrink-0'"
          >
            <img
              v-if="article.featuredImage"
              :src="article.featuredImage"
              :alt="getArticleTitle(article)"
              :class="
                viewMode === 'grid'
                  ? 'w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                  : 'w-full h-full object-cover transition-transform duration-300 hover:scale-105 rounded-l-lg'
              "
              loading="lazy"
            />
            <div
              v-else
              :class="
                viewMode === 'grid'
                  ? 'w-full h-full flex items-center justify-center bg-gray-200'
                  : 'w-full h-full flex items-center justify-center bg-gray-200 rounded-l-lg'
              "
            >
              <Icon name="i-lucide-file-text" class="w-12 h-12 text-gray-400" />
            </div>
          </NuxtLink>

          <!-- Article Content -->
          <div :class="viewMode === 'grid' ? 'article-card-content' : 'flex-1 p-6 flex flex-col'">
            <div class="flex items-center text-sm text-gray-500 mb-3">
              <Icon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
              <time :datetime="article.createdAt">
                {{ formatDate(article.createdAt) }}
              </time>
              <span class="mx-2">•</span>
              <Icon name="i-lucide-user" class="w-4 h-4 mr-1" />
              <span>{{
                article.author?.displayName || article.author?.login || 'Unknown Author'
              }}</span>
            </div>

            <NuxtLink :to="`/blog/${article.slug || article.id}`">
              <h2
                class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors"
              >
                {{ getArticleTitle(article) }}
              </h2>
            </NuxtLink>

            <div
              v-if="getArticleExcerpt(article)"
              class="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="getArticleExcerpt(article)" />
            </div>
            <div v-else class="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="getTextExcerpt(getArticleContent(article))" />
            </div>

            <div class="flex items-center justify-between mt-auto">
              <NuxtLink
                :to="`/blog/${article.slug || article.id}`"
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                {{ $t('blog.readMore', 'Read More') }}
                <Icon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
              </NuxtLink>

              <div v-if="article.status" class="flex items-center">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': article.status === 'PUBLISHED',
                    'bg-yellow-100 text-yellow-800': article.status === 'DRAFT',
                    'bg-gray-100 text-gray-800': article.status === 'ARCHIVED'
                  }"
                >
                  {{ $t(`blog.status.${article.status?.toLowerCase()}`, article.status) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 inline-block">
          <Icon name="i-lucide-file-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ $t('blog.empty.title', 'No articles found') }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ $t('blog.empty.message', 'Check back later for new content') }}
          </p>
          <NuxtLink
            to="/"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ $t('blog.empty.backHome', 'Back to Home') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Styles moved to main.css -->
