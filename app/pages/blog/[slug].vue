<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const { setupCodeBlocks } = useCodeBlock()

// Get article ID from route params
const articleId = route.params.slug as string

// Template Ref für Article Content
const articleContent = ref<HTMLElement>()

// Fetch single article
const { data: response, pending, error } = await useFetch(`/api/posts/${articleId}`)

const article = computed(() => {
  return response.value?.data || null
})

// Helper functions for multilingual content
const getArticleTitle = (article: any) => {
  if (article?.translations?.length) {
    const translation =
      article.translations.find((t: any) => t.lang === locale.value) || article.translations[0]
    return translation?.title || article.title || 'Untitled'
  }
  return article?.title || 'Untitled'
}

const getArticleContent = (article: any) => {
  if (article?.translations?.length) {
    const translation =
      article.translations.find((t: any) => t.lang === locale.value) || article.translations[0]
    return translation?.content || article.content || ''
  }
  return article?.content || ''
}

const getArticleExcerpt = (article: any) => {
  if (article?.translations?.length) {
    const translation =
      article.translations.find((t: any) => t.lang === locale.value) || article.translations[0]
    return translation?.excerpt || article.excerpt || ''
  }
  return article?.excerpt || ''
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// SEO Meta
const title = computed(() => getArticleTitle(article.value))
const description = computed(
  () => getArticleExcerpt(article.value) || getArticleContent(article.value)?.substring(0, 160)
)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'article'
})

// Setup code blocks when article content changes
watchEffect(() => {
  if (article.value && articleContent.value) {
    nextTick(() => {
      setupCodeBlocks(articleContent.value!)
    })
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="pending" class="max-w-4xl mx-auto">
      <div class="animate-pulse">
        <!-- Breadcrumb skeleton -->
        <div class="h-4 bg-gray-300 rounded w-48 mb-8"></div>

        <!-- Title skeleton -->
        <div class="h-8 bg-gray-300 rounded mb-4"></div>
        <div class="h-6 bg-gray-300 rounded w-3/4 mb-8"></div>

        <!-- Meta skeleton -->
        <div class="flex items-center space-x-4 mb-8">
          <div class="h-4 bg-gray-300 rounded w-32"></div>
          <div class="h-4 bg-gray-300 rounded w-24"></div>
        </div>

        <!-- Content skeleton -->
        <div class="space-y-4">
          <div class="h-4 bg-gray-300 rounded"></div>
          <div class="h-4 bg-gray-300 rounded"></div>
          <div class="h-4 bg-gray-300 rounded w-5/6"></div>
          <div class="h-4 bg-gray-300 rounded"></div>
          <div class="h-4 bg-gray-300 rounded w-4/5"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto text-center py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-8">
        <Icon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-red-800 mb-4">
          {{ $t('article.error.title', 'Article not found') }}
        </h1>
        <p class="text-red-600 mb-6">
          {{
            $t(
              'article.error.message',
              'The article you are looking for does not exist or has been removed.'
            )
          }}
        </p>
        <NuxtLink
          to="/blog"
          class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          {{ $t('article.error.backToBlog', 'Back to Blog') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="article" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="mb-8">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <NuxtLink to="/" class="hover:text-blue-600">
              {{ $t('breadcrumb.home', 'Home') }}
            </NuxtLink>
          </li>
          <li>
            <Icon name="i-lucide-chevron-right" class="w-4 h-4" />
          </li>
          <li>
            <NuxtLink to="/blog" class="hover:text-blue-600">
              {{ $t('breadcrumb.blog', 'Blog') }}
            </NuxtLink>
          </li>
          <li>
            <Icon name="i-lucide-chevron-right" class="w-4 h-4" />
          </li>
          <li class="text-gray-900">
            {{ getArticleTitle(article) }}
          </li>
        </ol>
      </nav>

      <!-- Article Header -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ getArticleTitle(article) }}
        </h1>

        <div v-if="getArticleExcerpt(article)" class="text-xl text-gray-600 mb-6">
          {{ getArticleExcerpt(article) }}
        </div>

        <div class="flex items-center space-x-6 text-sm text-gray-500">
          <div class="flex items-center">
            <Icon name="i-lucide-calendar" class="w-4 h-4 mr-2" />
            <time :datetime="article.createdAt">
              {{ formatDate(article.createdAt) }}
            </time>
          </div>

          <div v-if="article.author" class="flex items-center">
            <Icon name="i-lucide-user" class="w-4 h-4 mr-2" />
            <span>{{
              article.author.displayName || article.author.login || 'Unknown Author'
            }}</span>
          </div>

          <div
            v-if="article.updatedAt && article.updatedAt !== article.createdAt"
            class="flex items-center"
          >
            <Icon name="i-lucide-edit" class="w-4 h-4 mr-2" />
            <span>{{ $t('article.updated', 'Updated') }}: {{ formatDate(article.updatedAt) }}</span>
          </div>
        </div>
      </header>

      <!-- Featured Image -->
      <div v-if="article.featuredImage" class="mb-8">
        <img
          :src="article.featuredImage"
          :alt="getArticleTitle(article)"
          class="w-full h-auto rounded-lg shadow-lg"
          loading="eager"
        />
      </div>

      <!-- Article Body -->
      <div ref="articleContent" class="prose-article prose-lg max-w-none mb-8">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="getArticleContent(article)"></div>
      </div>

      <!-- Article Footer -->
      <footer class="border-t pt-8">
        <div class="flex items-center justify-between">
          <NuxtLink
            to="/blog"
            class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <Icon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
            {{ $t('article.backToBlog', 'Back to Blog') }}
          </NuxtLink>

          <div class="flex items-center space-x-4">
            <!-- Social sharing could go here -->
            <button
              class="text-gray-600 hover:text-gray-900"
              :title="$t('article.goBack', 'Go Back')"
              @click="$router.back()"
            >
              <Icon name="i-lucide-undo" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </article>

    <!-- Empty State (shouldn't happen with proper error handling) -->
    <div v-else class="max-w-2xl mx-auto text-center py-12">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <Icon name="i-lucide-file-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          {{ $t('article.notFound.title', 'Article not found') }}
        </h1>
        <p class="text-gray-600 mb-6">
          {{ $t('article.notFound.message', 'This article may have been moved or deleted.') }}
        </p>
        <NuxtLink
          to="/blog"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ $t('article.notFound.backToBlog', 'Back to Blog') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<!-- Styles moved to main.css -->
