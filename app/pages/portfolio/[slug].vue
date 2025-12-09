<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()

// Get portfolio slug from route params
const portfolioSlug = route.params.slug as string

// Fetch single portfolio from API
const { data: response, pending, error } = await useFetch(`/api/portfolios/${portfolioSlug}`)

const portfolio = computed(() => {
  return response.value?.data || null
})

// Helper functions for multilingual content
const getPortfolioTitle = (portfolio: any) => {
  if (portfolio?.translations?.length) {
    const translation =
      portfolio.translations.find((t: any) => t.lang === locale.value) || portfolio.translations[0]
    return translation?.title || portfolio.title || 'Untitled Portfolio'
  }
  return portfolio?.title || 'Untitled Portfolio'
}

const getPortfolioContent = (portfolio: any) => {
  if (portfolio?.translations?.length) {
    const translation =
      portfolio.translations.find((t: any) => t.lang === locale.value) || portfolio.translations[0]
    return translation?.content || portfolio.content || ''
  }
  return portfolio?.content || ''
}

const getPortfolioExcerpt = (portfolio: any) => {
  if (portfolio?.translations?.length) {
    const translation =
      portfolio.translations.find((t: any) => t.lang === locale.value) || portfolio.translations[0]
    return translation?.excerpt || portfolio.excerpt || ''
  }
  return portfolio?.excerpt || ''
}

// Get featured image from portfolio
const getFeaturedImage = (portfolio: any) => {
  return portfolio?.featuredImage || null
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

// SEO Meta
const title = computed(() => getPortfolioTitle(portfolio.value))
const description = computed(
  () =>
    getPortfolioExcerpt(portfolio.value) || getPortfolioContent(portfolio.value)?.substring(0, 160)
)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="animate-pulse">
          <!-- Breadcrumb skeleton -->
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-8"></div>

          <!-- Title skeleton -->
          <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>

          <!-- Featured image skeleton -->
          <div class="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-8"></div>

          <!-- Content skeleton -->
          <div class="space-y-4">
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !portfolio" class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto text-center py-12">
        <UCard class="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div class="p-8">
            <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 class="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              {{ $t('portfolio.error.title', 'Portfolio project not found') }}
            </h1>
            <p class="text-red-600 dark:text-red-400 mb-6">
              {{
                $t(
                  'portfolio.error.message',
                  'The portfolio project you are looking for does not exist or has been removed.'
                )
              }}
            </p>
            <div class="flex gap-4 justify-center">
              <UButton to="/portfolio" color="error" variant="solid" icon="i-lucide-briefcase">
                {{ $t('portfolio.error.backToPortfolio', 'Back to Portfolio') }}
              </UButton>
              <UButton to="/" color="error" variant="outline" icon="i-lucide-arrow-left">
                {{ $t('portfolio.error.backToHome', 'Back to Home') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Portfolio Content -->
    <div v-else class="w-full">
      <!-- Article Content Container -->
      <article class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <nav class="mb-8">
          <ol class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <NuxtLink to="/" class="hover:text-primary-600 dark:hover:text-primary-400">
                {{ $t('breadcrumb.home', 'Home') }}
              </NuxtLink>
            </li>
            <li>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
            </li>
            <li>
              <NuxtLink to="/portfolio" class="hover:text-primary-600 dark:hover:text-primary-400">
                {{ $t('breadcrumb.portfolio', 'Portfolio') }}
              </NuxtLink>
            </li>
            <li>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
            </li>
            <li class="text-gray-900 dark:text-gray-100">
              {{ getPortfolioTitle(portfolio) }}
            </li>
          </ol>
        </nav>

        <!-- Portfolio Header -->
        <UCard class="mb-8">
          <div class="p-8">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {{ getPortfolioTitle(portfolio) }}
            </h1>

            <div
              v-if="getPortfolioExcerpt(portfolio)"
              class="text-xl text-gray-600 dark:text-gray-400 mb-6"
            >
              {{ getPortfolioExcerpt(portfolio) }}
            </div>

            <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2" />
                <time :datetime="portfolio.createdAt">
                  {{ formatDate(portfolio.createdAt) }}
                </time>
              </div>

              <div v-if="portfolio.author" class="flex items-center">
                <UIcon name="i-lucide-user" class="w-4 h-4 mr-2" />
                <span>{{
                  portfolio.author.displayName || portfolio.author.login || 'Unknown Author'
                }}</span>
              </div>

              <div v-if="portfolio.status" class="flex items-center">
                <UBadge
                  :color="portfolio.status === 'PUBLISHED' ? 'success' : 'warning'"
                  :label="portfolio.status.toLowerCase()"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Featured Image -->
        <UCard v-if="getFeaturedImage(portfolio)" class="mb-8">
          <div class="relative">
            <img
              :src="getFeaturedImage(portfolio)"
              :alt="getPortfolioTitle(portfolio)"
              class="w-full h-auto rounded-lg shadow-lg object-cover max-h-96"
              loading="eager"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <!-- Fallback placeholder if image fails to load -->
            <div
              class="absolute inset-0 bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg flex items-center justify-center"
              style="z-index: -1"
            >
              <UIcon
                name="i-lucide-image"
                class="w-16 h-16 text-primary-400 dark:text-primary-600"
              />
            </div>
          </div>
        </UCard>

        <!-- Portfolio Content -->
        <UCard>
          <div class="p-8">
            <div class="prose prose-lg max-w-none dark:prose-invert">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="getPortfolioContent(portfolio)"></div>
            </div>

            <!-- Empty content fallback -->
            <div
              v-if="!getPortfolioContent(portfolio)"
              class="text-center py-12 text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-4" />
              <p>{{ $t('portfolio.noContent', 'No content available for this project.') }}</p>
            </div>
          </div>
        </UCard>

        <!-- Portfolio Footer -->
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <UButton to="/portfolio" color="primary" variant="soft" icon="i-lucide-briefcase">
              {{ $t('portfolio.backToPortfolio', 'Back to Portfolio') }}
            </UButton>

            <div class="flex items-center space-x-4">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-undo"
                :title="$t('portfolio.goBack', 'Go Back')"
                @click="$router.back()"
              >
                {{ $t('portfolio.goBack', 'Go Back') }}
              </UButton>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
