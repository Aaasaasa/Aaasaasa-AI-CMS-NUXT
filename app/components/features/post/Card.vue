<template>
  <UCard
    :class="[
      'group bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 hover:ring-primary-200/60 dark:hover:ring-primary-700/60 hover:-translate-y-1 border-0 shadow-sm',
      viewMode === 'list' ? 'ring-1 ring-primary-200/30 dark:ring-primary-700/30' : ''
    ]"
  >
    <div class="space-y-6">
      <!-- Featured Image -->
      <div v-if="post.featuredImage" class="w-full h-48 overflow-hidden rounded-lg mb-4">
        <NuxtLink :to="`/blog/${post.slug || post.id}`" class="block w-full h-full">
          <img
            :src="post.featuredImage"
            :alt="post.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            loading="lazy"
          />
        </NuxtLink>
      </div>
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-2 h-2 bg-primary-500 rounded-full" />
            <span
              class="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded-full"
            >
              {{ t('posts.type') }}
            </span>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300 leading-tight group-hover:scale-105 origin-left"
          >
            <NuxtLink
              :to="`/blog/${post.slug || post.id}`"
              class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
            >
              {{ post.title }}
            </NuxtLink>
          </h3>
        </div>
        <UDropdownMenu v-if="isOwner" :items="dropdownItems">
          <UButton
            variant="ghost"
            color="secondary"
            icon="i-lucide-more-vertical"
            size="sm"
            square
            class="opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-secondary-100 dark:hover:bg-secondary-900/50"
          />
        </UDropdownMenu>
      </div>

      <div class="relative">
        <div
          :class="[
            'text-gray-600 dark:text-gray-300 leading-relaxed text-base prose prose-sm max-w-none',
            displayMode === 'compact' ? 'line-clamp-3' : ''
          ]"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="getExcerptFromContent(post.content)" />
        </div>
        <div
          v-if="displayMode === 'compact'"
          class="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"
        />
      </div>

      <div
        class="flex items-center justify-between pt-4 border-t border-primary-200/30 dark:border-primary-700/30"
      >
        <div
          :class="viewMode === 'grid' ? 'flex flex-col gap-2' : 'flex items-center gap-4'"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          <div
            class="flex items-center gap-2 transition-colors duration-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <UIcon name="i-lucide-user" class="w-4 h-4" />
            <span>{{ post.author?.username || post.author?.firstName || 'Auteur inconnu' }}</span>
          </div>
          <div
            class="flex items-center gap-2 transition-colors duration-300 hover:text-secondary-600 dark:hover:text-secondary-400"
          >
            <UIcon name="i-lucide-calendar" class="w-4 h-4" />
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
          <div
            v-if="post.updatedAt !== post.createdAt"
            class="flex items-center gap-2 transition-colors duration-300 hover:text-secondary-600 dark:hover:text-secondary-400"
          >
            <UIcon name="i-lucide-pencil" class="w-4 h-4" />
            <span>{{ formatDate(post.updatedAt) }}</span>
          </div>
        </div>

        <!-- Read More Button -->
        <div class="flex justify-end mt-4">
          <NuxtLink
            :to="`/blog/${post.slug || post.id}`"
            class="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors group/link"
          >
            {{ t('blog.readMore', 'Read More') }}
            <UIcon
              name="i-lucide-arrow-right"
              class="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { FeaturesPostCreateModal, FeaturesPostDeleteModal } from '#components'

const { t } = useI18n()
const { user } = useUserSession()

interface Props {
  post: any // PostWithAuthor type fix
  displayMode?: 'compact' | 'extended'
  viewMode?: 'list' | 'grid'
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: 'compact',
  viewMode: 'list'
})

const emit = defineEmits<{
  refresh: []
}>()

const isOwner = computed(() => {
  return user.value && props.post.authorId === (user.value as any)?.id
})

// Helper function to create excerpt from HTML content (SSR-safe)
const getExcerptFromContent = (htmlContent: string) => {
  if (!htmlContent) return ''

  // Remove HTML tags using regex (works on server and client)
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove other HTML entities
    .trim()

  // Create excerpt (first 150 characters)
  const excerpt = textContent.substring(0, 150)
  return excerpt + (textContent.length > 150 ? '...' : '')
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const overlay = useOverlay()
const editModal = overlay.create(FeaturesPostCreateModal)
const deleteModal = overlay.create(FeaturesPostDeleteModal)

const dropdownItems = [
  [
    {
      label: t('actions.edit'),
      icon: 'i-lucide-pencil',
      async onSelect() {
        const result = await editModal.open({
          mode: 'edit',
          post: props.post,
          open: true
        }).result
        if (result?.success) emit('refresh')
      }
    }
  ],
  [
    {
      label: t('actions.delete'),
      icon: 'i-lucide-trash-2',
      async onSelect() {
        const result = await deleteModal.open({
          post: props.post,
          open: true
        }).result
        if (result?.success) emit('refresh')
      }
    }
  ]
]
</script>
