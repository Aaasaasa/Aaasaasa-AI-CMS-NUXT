<!-- app/components/ui/OptimizedImage.vue -->
<!-- Moderne Bildkomponente mit WebP/AVIF Support -->

<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    :preset="preset"
    :loading="loading"
    :sizes="sizes"
    :placeholder="placeholder"
    :class="imageClasses"
    @error="onError"
    @load="onLoad"
  />
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  preset?: 'featured' | 'thumbnail' | 'avatar'
  loading?: 'lazy' | 'eager'
  sizes?: string
  placeholder?: string | boolean
  class?: string
}

interface Emits {
  error: [error: string | Event]
  load: [event: Event]
}

const props = withDefaults(defineProps<Props>(), {
  preset: 'thumbnail',
  loading: 'lazy',
  sizes: '',
  placeholder: true,
  class: ''
})

const emit = defineEmits<Emits>()

// CSS Klassen basierend auf Preset
const imageClasses = computed(() => {
  const baseClasses = 'transition-opacity duration-300'
  const presetClasses = {
    featured: 'w-full h-64 object-cover rounded-lg',
    thumbnail: 'w-full h-48 object-cover rounded-md',
    avatar: 'w-12 h-12 object-cover rounded-full'
  }

  return [baseClasses, presetClasses[props.preset], props.class].filter(Boolean).join(' ')
})

// Responsive Sizes für verschiedene Presets
const sizes = computed(() => {
  if (props.sizes) return props.sizes

  const presetSizes = {
    featured: 'sm:640px md:768px lg:1024px xl:1280px',
    thumbnail: 'sm:320px md:400px lg:480px',
    avatar: '48px'
  }

  return presetSizes[props.preset] || presetSizes.thumbnail
})

function onError(error: string | Event) {
  emit('error', error)
}

function onLoad(event: Event) {
  emit('load', event)
}
</script>

<style scoped>
/* Fade-in Animation beim Laden */
img {
  opacity: 0;
  transition: opacity 0.3s ease;
}

img[data-nuxt-img-loaded] {
  opacity: 1;
}

/* Placeholder Styling */
img[data-nuxt-img-placeholder] {
  filter: blur(4px);
  transform: scale(1.05);
}
</style>
