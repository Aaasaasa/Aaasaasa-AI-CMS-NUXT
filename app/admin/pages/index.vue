<template>
  <div
    class="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 min-h-screen"
  >
    <!-- Hero Section -->
    <section
      class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 text-white overflow-hidden"
    >
      <div class="relative py-20 text-center">
        <div class="max-w-4xl mx-auto">
          <h1
            class="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent"
          >
            {{ t('hero.title') }}
          </h1>

          <p
            class="text-xl md:text-2xl text-primary-100 dark:text-primary-200 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            {{ t('hero.subtitle') }}
          </p>

          <UButton
            size="lg"
            color="primary"
            variant="outline"
            icon="i-lucide-arrow-down"
            class="border-white/30 text-white hover:bg-white/10 transition-all duration-200"
            @click="scrollToContent"
          >
            {{ t('actions.viewPosts') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <UContainer ref="contentRef" class="py-16">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {{ t('posts.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('posts.subtitle') }}
      </p>

      <div
        class="mt-8 text-center border border-dashed border-gray-300 dark:border-gray-700 p-12 rounded-lg"
      >
        <UIcon
          name="i-lucide-file-plus"
          class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
        />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('posts.empty.title') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('posts.empty.subtitle') }}
        </p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Scroll ref
const contentRef = ref<HTMLElement>()

const scrollToContent = () => {
  contentRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
