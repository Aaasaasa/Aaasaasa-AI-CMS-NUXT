<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()

// Get page slug from route params
const pageSlug = route.params.slug as string

// Check if this is a reserved route that should not be handled
const reservedRoutes = ['auth', 'blog', 'admin', 'api', 'cookies', 'index']
if (reservedRoutes.some((reserved) => pageSlug?.startsWith(reserved))) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

// Fetch single page from API
const { data: response, pending, error } = await useFetch(`/api/pages/${pageSlug}`)

const page = computed(() => {
  return response.value?.data || null
})

// Helper functions for multilingual content
const getPageTitle = (page: any) => {
  if (page?.translations?.length) {
    const translation =
      page.translations.find((t: any) => t.lang === locale.value) || page.translations[0]
    return translation?.title || page.title || 'Untitled Page'
  }
  return page?.title || 'Untitled Page'
}

const getPageContent = (page: any) => {
  if (page?.translations?.length) {
    const translation =
      page.translations.find((t: any) => t.lang === locale.value) || page.translations[0]
    return translation?.content || page.content || ''
  }
  return page?.content || ''
}

const getPageExcerpt = (page: any) => {
  if (page?.translations?.length) {
    const translation =
      page.translations.find((t: any) => t.lang === locale.value) || page.translations[0]
    return translation?.excerpt || page.excerpt || ''
  }
  return page?.excerpt || ''
}

// Get featured image from page
const getFeaturedImage = (page: any) => {
  return page?.featuredImage || null
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
const title = computed(() => getPageTitle(page.value))
const description = computed(
  () => getPageExcerpt(page.value) || getPageContent(page.value)?.substring(0, 160)
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
    <div v-else-if="error || !page" class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto text-center py-12">
        <UCard class="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div class="p-8">
            <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 class="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              {{ $t('page.error.title', 'Page not found') }}
            </h1>
            <p class="text-red-600 dark:text-red-400 mb-6">
              {{
                $t(
                  'page.error.message',
                  'The page you are looking for does not exist or has been removed.'
                )
              }}
            </p>
            <UButton to="/" color="red" variant="solid" icon="i-lucide-arrow-left">
              {{ $t('page.error.backToHome', 'Back to Home') }}
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Page Content -->
    <div v-else class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
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
            <li class="text-gray-900 dark:text-gray-100">
              {{ getPageTitle(page) }}
            </li>
          </ol>
        </nav>

        <!-- Page Header -->
        <UCard class="mb-8">
          <div class="p-8">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {{ getPageTitle(page) }}
            </h1>

            <div v-if="getPageExcerpt(page)" class="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {{ getPageExcerpt(page) }}
            </div>

            <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2" />
                <time :datetime="page.createdAt">
                  {{ formatDate(page.createdAt) }}
                </time>
              </div>

              <div v-if="page.author" class="flex items-center">
                <UIcon name="i-lucide-user" class="w-4 h-4 mr-2" />
                <span>{{
                  page.author.displayName || page.author.username || 'Unknown Author'
                }}</span>
              </div>

              <div v-if="page.status" class="flex items-center">
                <UBadge
                  :color="page.status === 'PUBLISHED' ? 'green' : 'yellow'"
                  :label="page.status.toLowerCase()"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Featured Image -->
        <UCard v-if="getFeaturedImage(page)" class="mb-8">
          <div class="relative">
            <img
              :src="getFeaturedImage(page)"
              :alt="getPageTitle(page)"
              class="w-full h-auto rounded-lg shadow-lg object-cover max-h-96"
              loading="eager"
              @error="$event.target.style.display = 'none'"
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

        <!-- Page Content -->
        <UCard>
          <div class="p-8">
            <div class="prose prose-lg max-w-none dark:prose-invert">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="getPageContent(page)"></div>
            </div>

            <!-- Empty content fallback -->
            <div
              v-if="!getPageContent(page)"
              class="text-center py-12 text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-4" />
              <p>{{ $t('page.noContent', 'No content available for this page.') }}</p>
            </div>
          </div>
        </UCard>

        <!-- Page Footer -->
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <UButton to="/" color="primary" variant="soft" icon="i-lucide-arrow-left">
              {{ $t('page.backToHome', 'Back to Home') }}
            </UButton>

            <div class="flex items-center space-x-4">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-lucide-undo"
                :title="$t('page.goBack', 'Go Back')"
                @click="$router.back()"
              >
                {{ $t('page.goBack', 'Go Back') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
