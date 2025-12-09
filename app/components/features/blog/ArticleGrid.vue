<script setup lang="ts">
interface Props {
  articles: any[]
  limit?: number
  showExcerpt?: boolean
  showAuthor?: boolean
  showDate?: boolean
  cardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  limit: 6,
  showExcerpt: true,
  showAuthor: true,
  showDate: true,
  cardClass: 'article-card'
})

const { locale } = useI18n()

const displayArticles = computed(() => {
  return props.articles.slice(0, props.limit)
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
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <article v-for="article in displayArticles" :key="article.id" :class="cardClass">
      <!-- Article Image Placeholder -->
      <div class="article-card-image">
        <Icon name="i-lucide-file-text" class="w-12 h-12 text-white opacity-80" />
      </div>

      <!-- Article Content -->
      <div class="article-card-content">
        <!-- Meta Information -->
        <div v-if="showDate || showAuthor" class="flex items-center text-sm text-gray-500 mb-3">
          <template v-if="showDate">
            <Icon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
            <time :datetime="article.createdAt">
              {{ formatDate(article.createdAt) }}
            </time>
          </template>

          <template v-if="showDate && showAuthor">
            <span class="mx-2">•</span>
          </template>

          <template v-if="showAuthor && article.author">
            <Icon name="i-lucide-user" class="w-4 h-4 mr-1" />
            <span>{{ article.author.displayName || article.author.name || 'Unknown Author' }}</span>
          </template>
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {{ getArticleTitle(article) }}
        </h3>

        <!-- Excerpt/Content -->
        <div v-if="showExcerpt" class="mb-4">
          <p v-if="getArticleExcerpt(article)" class="text-gray-600 line-clamp-3">
            {{ getArticleExcerpt(article) }}
          </p>
          <p v-else class="text-gray-600 line-clamp-3">
            {{ getArticleContent(article)?.substring(0, 150)
            }}{{ (getArticleContent(article)?.length || 0) > 150 ? '...' : '' }}
          </p>
        </div>

        <!-- Read More Link -->
        <div class="flex items-center justify-between">
          <NuxtLink
            :to="`/blog/${article.slug || article.id}`"
            class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            {{ $t('article.readMore', 'Read More') }}
            <Icon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
          </NuxtLink>

          <!-- Status Badge (if applicable) -->
          <div v-if="article.status && article.status !== 'PUBLISHED'" class="flex items-center">
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="{
                'bg-yellow-100 text-yellow-800': article.status === 'DRAFT',
                'bg-gray-100 text-gray-800': article.status === 'ARCHIVED',
                'bg-orange-100 text-orange-800': article.status === 'PENDING'
              }"
            >
              {{ $t(`article.status.${article.status?.toLowerCase()}`, article.status) }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<!-- Styles moved to main.css -->
