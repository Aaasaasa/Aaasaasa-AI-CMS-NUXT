<template>
  <div class="w-full bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="pending" class="w-full">
      <div class="container mx-auto px-4 py-8 max-w-[1600px]">
        <div class="mx-auto">
          <div class="animate-pulse">
            <!-- Title skeleton -->
            <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>

            <!-- Grid skeleton -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <div
                v-for="i in 8"
                :key="i"
                class="bg-gray-300 dark:bg-gray-700 rounded-lg"
                style="min-height: 300px"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !portfolios?.length" class="w-full">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto text-center py-12">
          <UCard class="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <div class="p-8">
              <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 class="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                {{ $t('portfolio.error.title', 'Portfolio not available') }}
              </h1>
              <p class="text-red-600 dark:text-red-400 mb-6">
                {{ $t('portfolio.error.message', 'Unable to load portfolio items at the moment.') }}
              </p>
              <UButton to="/" color="error" variant="solid" icon="i-lucide-arrow-left">
                {{ $t('portfolio.error.backToHome', 'Back to Home') }}
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Portfolio Grid -->
    <div v-else class="w-full">
      <div class="container mx-auto px-4 py-8 max-w-[1600px]">
        <div class="mx-auto">
          <!-- Header -->
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {{ $t('portfolio.title', 'Our Work') }}
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {{
                $t(
                  'portfolio.subtitle',
                  'Explore our portfolio of web development projects, showcasing modern technologies and innovative solutions.'
                )
              }}
            </p>
          </div>

          <!-- Portfolio Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <UCard
              v-for="portfolio in portfolios"
              :key="portfolio.id"
              class="group hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full"
            >
              <div class="relative">
                <!-- Featured Image (Clickable) -->
                <NuxtLink
                  v-if="portfolio.featuredImage"
                  :to="`/portfolio/${portfolio.slug}`"
                  class="relative block h-48 overflow-hidden"
                >
                  <img
                    :src="portfolio.featuredImage"
                    :alt="portfolio.title"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                  />
                  <!-- Fallback placeholder if image fails to load -->
                  <div
                    class="absolute inset-0 bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center"
                    style="z-index: -1"
                  >
                    <UIcon
                      name="i-lucide-image"
                      class="w-12 h-12 text-primary-400 dark:text-primary-600"
                    />
                  </div>
                </NuxtLink>

                <!-- Content -->
                <div class="p-6">
                  <NuxtLink :to="`/portfolio/${portfolio.slug}`">
                    <h3
                      class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 hover:text-primary-600 transition-colors"
                    >
                      {{ portfolio.title }}
                    </h3>
                  </NuxtLink>

                  <div
                    v-if="portfolio.excerpt"
                    class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3"
                  >
                    {{ portfolio.excerpt }}
                  </div>

                  <!-- Meta Info -->
                  <div
                    class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4"
                  >
                    <div class="flex items-center">
                      <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
                      <time :datetime="portfolio.createdAt">
                        {{ formatDate(portfolio.createdAt) }}
                      </time>
                    </div>

                    <UBadge
                      :color="portfolio.status === 'PUBLISHED' ? 'success' : 'warning'"
                      :label="portfolio.status.toLowerCase()"
                    />
                  </div>

                  <!-- View Project Button -->
                  <UButton
                    :to="`/portfolio/${portfolio.slug}`"
                    color="primary"
                    variant="solid"
                    block
                    icon="i-lucide-eye"
                    class="group-hover:bg-primary-600"
                  >
                    {{ $t('portfolio.viewProject', 'View Project') }}
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <!-- No Portfolio Items -->
          <div v-if="portfolios.length === 0" class="text-center py-12">
            <UIcon name="i-lucide-briefcase" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {{ $t('portfolio.empty.title', 'No Portfolio Items') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{
                $t(
                  'portfolio.empty.message',
                  'Portfolio items will appear here once they are published.'
                )
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

// Fetch portfolios from API
const { data: response, pending, error } = await useFetch('/api/portfolios')

const portfolios = computed(() => {
  return response.value?.data || []
})

// Helper functions
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
useSeoMeta({
  title: 'Portfolio - Our Work',
  description:
    'Explore our portfolio of web development projects, showcasing modern technologies and innovative solutions.',
  ogTitle: 'Portfolio - Our Work',
  ogDescription:
    'Explore our portfolio of web development projects, showcasing modern technologies and innovative solutions.',
  ogType: 'website'
})
</script>
