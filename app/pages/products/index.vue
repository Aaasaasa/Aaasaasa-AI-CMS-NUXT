<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <div class="animate-pulse">
          <!-- Title skeleton -->
          <div class="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>

          <!-- Grid skeleton -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="bg-gray-300 dark:bg-gray-700 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto text-center py-12">
        <UCard class="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div class="p-8">
            <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 class="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              {{ $t('shop.error.title', 'Shop not available') }}
            </h1>
            <p class="text-red-600 dark:text-red-400 mb-6">
              {{ $t('shop.error.message', 'Unable to load products at the moment.') }}
            </p>
            <UButton to="/" color="error" variant="solid" icon="i-lucide-arrow-left">
              {{ $t('shop.error.backToHome', 'Back to Home') }}
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Shop Content -->
    <div v-else class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {{ $t('shop.title', 'Shop') }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {{
              $t(
                'shop.subtitle',
                'Entdecken Sie unser Sortiment an hochwertigen Produkten und Dienstleistungen.'
              )
            }}
          </p>

          <!-- Product Count -->
          <div class="mt-6">
            <UBadge
              :label="
                $t('shop.productCount', `{count} Produkte verfügbar`, { count: products.length })
              "
              color="primary"
              variant="soft"
            />
          </div>
        </div>

        <!-- Products Grid -->
        <div
          v-if="products.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <UCard
            v-for="product in products"
            :key="product.id"
            class="group hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div class="relative">
              <!-- Featured Image -->
              <div class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  v-if="product.featuredImage"
                  :src="product.featuredImage"
                  :alt="product.title"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  @error="$event.target.style.display = 'none'"
                />
                <!-- Fallback placeholder if no image -->
                <div
                  class="absolute inset-0 bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center"
                  :class="{ 'z-10': !product.featuredImage }"
                >
                  <UIcon
                    name="i-lucide-shopping-bag"
                    class="w-12 h-12 text-primary-400 dark:text-primary-600"
                  />
                </div>

                <!-- Stock Badge -->
                <div class="absolute top-2 right-2">
                  <UBadge
                    :color="product.stock > 0 ? 'success' : 'error'"
                    :label="
                      product.stock > 0
                        ? $t('shop.inStock', 'Auf Lager')
                        : $t('shop.outOfStock', 'Ausverkauft')
                    "
                    size="xs"
                  />
                </div>
              </div>

              <!-- Content -->
              <div class="p-4">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2"
                >
                  {{ product.title }}
                </h3>

                <div
                  v-if="product.description"
                  class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm"
                >
                  {{ product.description.replace(/<[^>]*>/g, '') }}
                </div>

                <!-- Price -->
                <div class="flex items-center justify-between mb-4">
                  <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {{ formatPrice(product.price, product.currency) }}
                  </div>

                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('shop.stock', 'Lager: {count}', { count: product.stock }) }}
                  </div>
                </div>

                <!-- Meta Info -->
                <div
                  class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4"
                >
                  <div class="flex items-center">
                    <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
                    <time :datetime="product.createdAt">
                      {{ formatDate(product.createdAt) }}
                    </time>
                  </div>

                  <div class="flex items-center">
                    <UIcon name="i-lucide-user" class="w-3 h-3 mr-1" />
                    <span>{{ product.vendor.displayName }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  <UButton
                    :to="`/products/${product.slug}`"
                    color="primary"
                    variant="solid"
                    size="sm"
                    icon="i-lucide-eye"
                    class="flex-1"
                    :disabled="product.stock === 0"
                  >
                    {{ $t('shop.viewProduct', 'Ansehen') }}
                  </UButton>

                  <UButton
                    color="success"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-shopping-cart"
                    :disabled="product.stock === 0"
                    @click="addToCart(product)"
                  >
                    {{ $t('shop.addToCart', 'In Warenkorb') }}
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- No Products -->
        <div v-else class="text-center py-16">
          <UIcon name="i-lucide-shopping-cart" class="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {{ $t('shop.empty.title', 'Keine Produkte verfügbar') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {{
              $t(
                'shop.empty.message',
                'Unser Shop ist derzeit leer. Schauen Sie später wieder vorbei oder kontaktieren Sie uns für mehr Informationen.'
              )
            }}
          </p>
          <div class="flex gap-4 justify-center">
            <UButton to="/kontakt" color="primary" variant="solid" icon="i-lucide-mail">
              {{ $t('shop.empty.contact', 'Kontakt aufnehmen') }}
            </UButton>
            <UButton to="/" color="neutral" variant="outline" icon="i-lucide-arrow-left">
              {{ $t('shop.empty.backToHome', 'Zur Startseite') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

// Fetch products from API
const { data: response, pending, error } = await useFetch('/api/products')

const products = computed(() => {
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

const formatPrice = (price: number, currency: string = 'EUR') => {
  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currency
    }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

const addToCart = (product: any) => {
  // TODO: Implement cart functionality

  // Show toast notification
  const toast = useToast()
  toast.add({
    title: 'Produkt hinzugefügt',
    description: `${product.title} wurde zum Warenkorb hinzugefügt.`,
    color: 'success',
    icon: 'i-lucide-check'
  })
} // SEO Meta
useSeoMeta({
  title: 'Shop - Unsere Produkte',
  description: 'Entdecken Sie unser Sortiment an hochwertigen Produkten und Dienstleistungen.',
  ogTitle: 'Shop - Unsere Produkte',
  ogDescription: 'Entdecken Sie unser Sortiment an hochwertigen Produkten und Dienstleistungen.',
  ogType: 'website'
})
</script>
