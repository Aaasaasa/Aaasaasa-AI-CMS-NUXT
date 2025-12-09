<script setup lang="ts">
const { loggedIn } = useUserSession()
const localePath = useLocalePath()
const { t, locale } = useI18n()

// Load CMS menu from API using our composable
const { getMenuAsSidebarItems } = useMenu()

// Load menu data
const cmsMenuItems = ref<SidebarItem[]>([])
const menuLoading = ref(true)

// Fetch menu on component mount AND when locale changes
const loadMenu = async () => {
  menuLoading.value = true
  try {
    const items = await getMenuAsSidebarItems('main-menu')
    cmsMenuItems.value = items
  } catch {
    // Silent fallback to default items
  } finally {
    menuLoading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadMenu()
})

// Reload menu when locale changes
watch(locale, () => {
  loadMenu()
})

// Fallback sidebar items if menu loading fails
const fallbackItems = computed<SidebarItem[]>(() => [
  {
    label: t('navigation.home', 'Home'),
    href: localePath('/'),
    icon: 'i-lucide-home'
  },
  {
    label: t('navigation.blog', 'Blog'),
    href: localePath('/blog'),
    icon: 'i-lucide-book-open'
  },
  {
    label: t('navigation.portfolio', 'Portfolio'),
    href: localePath('/portfolio'),
    icon: 'i-lucide-briefcase'
  },
  {
    label: t('navigation.products', 'Products'),
    href: localePath('/products'),
    icon: 'i-lucide-shopping-cart'
  },
  {
    label: t('navigation.about', 'About'),
    href: localePath('/about'),
    icon: 'i-lucide-user'
  },
  {
    label: t('navigation.contact', 'Contact'),
    href: localePath('/contact'),
    icon: 'i-lucide-mail'
  }
])

// Use CMS menu if available, otherwise fallback
const sidebarItems = computed<SidebarItem[]>(() => {
  return cmsMenuItems.value.length > 0 ? cmsMenuItems.value : fallbackItems.value
})

// Admin items for logged in users
const adminItems = computed<SidebarItem[]>(() =>
  loggedIn.value
    ? [
        {
          label: t('navigation.admin', 'Admin'),
          href: localePath('/admin'),
          icon: 'i-lucide-settings',
          children: [
            {
              label: t('navigation.dashboard', 'Dashboard'),
              href: localePath('/admin/dashboard'),
              icon: 'i-lucide-layout-dashboard'
            },
            {
              label: t('navigation.posts', 'Posts'),
              href: localePath('/admin/posts'),
              icon: 'i-lucide-file-text'
            },
            {
              label: t('navigation.users', 'Users'),
              href: localePath('/admin/users'),
              icon: 'i-lucide-users'
            }
          ]
        }
      ]
    : []
)

// Props for controlling sidebar
interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true // Default: sichtbar
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Close sidebar on mobile after navigation
const closeSidebarOnMobile = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    isOpen.value = false
  }
}
</script>

<template>
  <!-- Overlay für mobile Geräte -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="isOpen = false" />

  <!-- Sidebar -->
  <aside
    :class="[
      'h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col z-50',
      'lg:relative lg:shrink-0',
      'fixed left-0 top-0 lg:static',
      isOpen
        ? 'w-64 translate-x-0'
        : 'w-0 lg:w-16 -translate-x-full lg:translate-x-0 overflow-hidden'
    ]"
  >
    <!-- Header mit Toggle -->
    <div
      class="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0"
    >
      <h2
        v-if="isOpen"
        class="text-lg font-semibold text-gray-900 dark:text-white transition-opacity duration-200"
      >
        {{ t('navigation.menu', 'Menu') }}
      </h2>
      <UButton
        :icon="isOpen ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
        :class="!isOpen && 'mx-auto'"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="isOpen = !isOpen"
      />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="menuLoading" class="space-y-1">
        <div class="animate-pulse space-y-2">
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <!-- Main Navigation -->
      <div v-else class="space-y-1">
        <template v-for="item in sidebarItems" :key="item.href">
          <div>
            <!-- Main Menu Item -->
            <NuxtLink
              :to="item.href"
              :class="[
                'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                !isOpen && 'justify-center'
              ]"
              :hreflang="locale"
              :title="!isOpen ? item.label : undefined"
              @click="closeSidebarOnMobile"
            >
              <UIcon v-if="item.icon" :name="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="isOpen" class="flex-1">{{ item.label }}</span>
              <span
                v-if="item.badge && isOpen"
                class="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
              >
                {{ item.badge }}
              </span>
              <!-- Show dropdown indicator for items with children -->
              <UIcon
                v-if="item.children && item.children.length > 0 && isOpen"
                name="i-lucide-chevron-down"
                class="w-4 h-4 shrink-0"
              />
            </NuxtLink>

            <!-- Sub-menu items (nur wenn offen) -->
            <div
              v-if="item.children && item.children.length > 0 && isOpen"
              class="ml-6 mt-1 space-y-1"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.href"
                :to="child.href"
                class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                :hreflang="locale"
                @click="closeSidebarOnMobile"
              >
                <UIcon v-if="child.icon" :name="child.icon" class="w-3 h-3 shrink-0" />
                <span>{{ child.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>

      <!-- CMS Menu Status (nur wenn offen) -->
      <div v-if="!menuLoading && isOpen" class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <p class="text-xs text-gray-400 dark:text-gray-500 px-3">
          <UIcon
            :name="cmsMenuItems.length > 0 ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
            :class="cmsMenuItems.length > 0 ? 'text-green-500' : 'text-amber-500'"
            class="inline w-3 h-3 mr-1"
          />
          {{ cmsMenuItems.length > 0 ? 'Aaasaasa CMS Menu' : 'Fallback Menu' }}
        </p>
      </div>

      <!-- Admin Section -->
      <div v-if="adminItems.length > 0" class="pt-4 border-t border-gray-200 dark:border-gray-800">
        <p v-if="isOpen" class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">
          {{ t('navigation.admin', 'Admin') }}
        </p>
        <template v-for="item in adminItems" :key="item.href">
          <!-- Admin parent item -->
          <NuxtLink
            :to="item.href"
            :class="[
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
              !isOpen && 'justify-center'
            ]"
            :hreflang="locale"
            :title="!isOpen ? item.label : undefined"
            @click="closeSidebarOnMobile"
          >
            <UIcon v-if="item.icon" :name="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="isOpen">{{ item.label }}</span>
          </NuxtLink>

          <!-- Admin sub-items (nur wenn offen) -->
          <div v-if="item.children && isOpen" class="ml-6 mt-1 space-y-1">
            <NuxtLink
              v-for="child in item.children"
              :key="child.href"
              :to="child.href"
              class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              :hreflang="locale"
              @click="closeSidebarOnMobile"
            >
              <UIcon v-if="child.icon" :name="child.icon" class="w-3 h-3 shrink-0" />
              <span>{{ child.label }}</span>
            </NuxtLink>
          </div>
        </template>
      </div>
    </nav>

    <!-- Footer -->
    <div v-if="isOpen" class="shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>NuxtWP Theme</p>
        <p>v{{ $config.public.version || '1.0.0' }}</p>
      </div>
    </div>
  </aside>
</template>
