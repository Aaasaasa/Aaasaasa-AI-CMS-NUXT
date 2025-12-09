<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <div class="animate-pulse">
          <!-- Breadcrumb skeleton -->
          <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-96 mb-6"></div>

          <!-- Content skeleton -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image skeleton -->
            <div class="bg-gray-300 dark:bg-gray-700 rounded-lg h-96"></div>

            <!-- Content skeleton -->
            <div class="space-y-4">
              <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
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
              {{ $t('product.error.title', 'Produkt nicht gefunden') }}
            </h1>
            <p class="text-red-600 dark:text-red-400 mb-6">
              {{
                $t('product.error.message', 'Das gewünschte Produkt konnte nicht gefunden werden.')
              }}
            </p>
            <div class="flex gap-4 justify-center">
              <UButton to="/products" color="error" variant="solid" icon="i-lucide-arrow-left">
                {{ $t('product.error.backToShop', 'Zurück zum Shop') }}
              </UButton>
              <UButton to="/" color="neutral" variant="outline" icon="i-lucide-home">
                {{ $t('product.error.backToHome', 'Zur Startseite') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Product Detail Content -->
    <div v-else-if="product" class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <ULink
            to="/"
            class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('breadcrumb.home', 'Startseite') }}
          </ULink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <ULink
            to="/products"
            class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('breadcrumb.shop', 'Shop') }}
          </ULink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <span class="text-gray-900 dark:text-gray-100 font-medium">
            {{ product.title }}
          </span>
        </nav>

        <!-- Product Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <!-- Product Image -->
          <div class="space-y-6">
            <!-- Main Image -->
            <div
              class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <img
                v-if="product.featuredImage"
                :src="product.featuredImage"
                :alt="product.title"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="$event.target.style.display = 'none'"
              />
              <!-- Fallback placeholder -->
              <div
                class="absolute inset-0 bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center"
                :class="{ 'z-10': !product.featuredImage }"
              >
                <UIcon
                  name="i-lucide-shopping-bag"
                  class="w-24 h-24 text-primary-400 dark:text-primary-600"
                />
              </div>

              <!-- Stock Badge -->
              <div class="absolute top-4 right-4">
                <UBadge
                  :color="product.stock > 0 ? 'success' : 'error'"
                  :label="
                    product.stock > 0
                      ? $t('product.inStock', 'Auf Lager')
                      : $t('product.outOfStock', 'Ausverkauft')
                  "
                  size="lg"
                />
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Title and Price -->
            <div>
              <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {{ product.title }}
              </h1>

              <div class="flex items-center gap-6 mb-6">
                <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {{ formatPrice(product.price, product.currency) }}
                </div>

                <div class="text-lg text-gray-600 dark:text-gray-400">
                  {{ $t('product.stock', 'Lager: {count}', { count: product.stock }) }}
                </div>
              </div>
            </div>

            <!-- Meta Information -->
            <UCard class="p-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="w-4 h-4 text-gray-500" />
                  <span class="text-gray-600 dark:text-gray-400"
                    >{{ $t('product.vendor', 'Anbieter') }}:</span
                  >
                  <span class="font-medium">{{ product.vendor.displayName }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-500" />
                  <span class="text-gray-600 dark:text-gray-400"
                    >{{ $t('product.created', 'Erstellt') }}:</span
                  >
                  <time :datetime="product.createdAt" class="font-medium">
                    {{ formatDate(product.createdAt) }}
                  </time>
                </div>

                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-500" />
                  <span class="text-gray-600 dark:text-gray-400"
                    >{{ $t('product.sku', 'Artikelnummer') }}:</span
                  >
                  <span class="font-medium">{{ product.slug.toUpperCase() }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-coins" class="w-4 h-4 text-gray-500" />
                  <span class="text-gray-600 dark:text-gray-400"
                    >{{ $t('product.currency', 'Währung') }}:</span
                  >
                  <span class="font-medium">{{ product.currency }}</span>
                </div>
              </div>
            </UCard>

            <!-- Action Buttons -->
            <div class="space-y-4">
              <UButton
                color="primary"
                variant="solid"
                size="xl"
                icon="i-lucide-shopping-cart"
                :disabled="product.stock === 0"
                class="w-full"
                @click="addToCart(product)"
              >
                {{
                  product.stock > 0
                    ? $t('product.addToCart', 'In den Warenkorb')
                    : $t('product.outOfStock', 'Ausverkauft')
                }}
              </UButton>

              <div class="flex gap-3">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-heart"
                  class="flex-1"
                  @click="addToWishlist(product)"
                >
                  {{ $t('product.wishlist', 'Merkliste') }}
                </UButton>

                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-share-2"
                  class="flex-1"
                  @click="shareProduct"
                >
                  {{ $t('product.share', 'Teilen') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Description -->
        <div v-if="product.description" class="mb-16">
          <UCard class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {{ $t('product.description', 'Produktbeschreibung') }}
            </h2>
            <div class="prose prose-gray dark:prose-invert max-w-none">
              {{ product.description?.replace(/<[^>]*>/g, '') }}
            </div>
          </UCard>
        </div>

        <!-- Related Products or Back to Shop -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-16">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {{ $t('product.moreProducts', 'Weitere Produkte entdecken') }}
            </h3>
            <UButton
              to="/products"
              color="primary"
              variant="outline"
              size="lg"
              icon="i-lucide-grid-3x3"
            >
              {{ $t('product.backToShop', 'Zurück zum Shop') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()

// Fetch product from API
const { data: response, pending, error } = await useFetch(`/api/products/${route.params.slug}`)

const product = computed(() => {
  return response.value?.data
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
}

const addToWishlist = (product: any) => {
  // TODO: Implement wishlist functionality

  // Show toast notification
  const toast = useToast()
  toast.add({
    title: 'Zur Merkliste hinzugefügt',
    description: `${product.title} wurde zur Merkliste hinzugefügt.`,
    color: 'info',
    icon: 'i-lucide-heart'
  })
}

const shareProduct = async () => {
  if (navigator.share && product.value) {
    try {
      await navigator.share({
        title: product.value.title,
        text: product.value.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        url: window.location.href
      })
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)

      const toast = useToast()
      toast.add({
        title: 'Link kopiert',
        description: 'Der Produktlink wurde in die Zwischenablage kopiert.',
        color: 'success',
        icon: 'i-lucide-copy'
      })
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(window.location.href)

    const toast = useToast()
    toast.add({
      title: 'Link kopiert',
      description: 'Der Produktlink wurde in die Zwischenablage kopiert.',
      color: 'success',
      icon: 'i-lucide-copy'
    })
  }
}

// 404 redirect if product not found
watch(
  [product, pending],
  ([newProduct, isPending]) => {
    if (!isPending && !newProduct && !error.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Produkt nicht gefunden'
      })
    }
  },
  { immediate: true }
)

// SEO Meta
useSeoMeta({
  title: computed(() =>
    product.value ? `${product.value.title} - Shop` : 'Produkt nicht gefunden'
  ),
  description: computed(() => {
    if (product.value?.description) {
      return product.value.description.replace(/<[^>]*>/g, '').substring(0, 160)
    }
    return 'Produktdetails und Informationen'
  }),
  ogTitle: computed(() =>
    product.value ? `${product.value.title} - Shop` : 'Produkt nicht gefunden'
  ),
  ogDescription: computed(() => {
    if (product.value?.description) {
      return product.value.description.replace(/<[^>]*>/g, '').substring(0, 160)
    }
    return 'Produktdetails und Informationen'
  }),
  ogImage: computed(() => product.value?.featuredImage),
  ogType: 'website'
})
</script>
