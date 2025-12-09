# 🎨 Layout System Architecture

Modern responsive layout system for the NuxtWP Multilang Theme, featuring AppSidebar and AppFooter components with mobile-first design patterns.

## 🏗️ Layout Component Overview

### Core Layout Structure

The layout system consists of three main components:

1. **default.vue** - Main layout template with sidebar integration
2. **AppSidebar.vue** - Responsive navigation sidebar
3. **AppFooter.vue** - Professional footer with author attribution

```vue
<!-- app/layouts/default.vue - Main Layout Structure -->
<template>
  <div class="min-h-screen flex">
    <!-- Responsive Sidebar -->
    <AppSidebar v-model="sidebarOpen" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <UMain>
        <!-- Header with sidebar toggle -->
        <UHeader>
          <template #title>
            <div class="flex items-center">
              <UButton icon="i-lucide-menu" @click="toggleSidebar" class="mr-3" />
              <h1>{{ appName }}</h1>
            </div>
          </template>
        </UHeader>

        <!-- Page content slot -->
        <slot />

        <!-- Modern footer -->
        <AppFooter />
      </UMain>
    </div>
  </div>
</template>
```

## 📱 AppSidebar Component

### Features & Functionality

- **Responsive Design**: Mobile overlay + desktop panel modes
- **Multi-language Navigation**: i18n integrated navigation items
- **Admin Section**: Role-based navigation for authenticated users
- **Auto-close Behavior**: Closes on route changes and outside clicks
- **Smooth Animations**: CSS transitions for open/close states

### Implementation Pattern

```vue
<!-- app/components/layout/AppSidebar.vue -->
<script setup lang="ts">
interface SidebarItem {
  label: string
  href: string
  icon: string
  badge?: string
  children?: SidebarItem[]
}

interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Reactive sidebar state
const sidebarOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Navigation items with i18n
const { loggedIn } = useUserSession()
const { t } = useI18n()
const localePath = useLocalePath()

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    label: t('navigation.home'),
    href: localePath('/'),
    icon: 'i-lucide-home'
  },
  {
    label: t('navigation.blog'),
    href: localePath('/blog'),
    icon: 'i-lucide-book-open'
  }
  // ... more items
])

// Admin items for authenticated users
const adminItems = computed<SidebarItem[]>(() =>
  loggedIn.value
    ? [
        {
          label: t('navigation.admin'),
          href: '/admin',
          icon: 'i-lucide-settings',
          children: [
            {
              label: t('navigation.dashboard'),
              href: '/admin/dashboard',
              icon: 'i-lucide-layout-dashboard'
            }
          ]
        }
      ]
    : []
)
</script>

<template>
  <div>
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 lg:hidden z-40"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar panel -->
    <aside
      :class="[
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800 z-50',
        'transform transition-transform duration-300 ease-in-out',
        'lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      style="width: 280px"
    >
      <!-- Sidebar content -->
    </aside>
  </div>
</template>
```

### Responsive Behavior

#### Mobile (< 1024px)

- **Hidden by default**: Sidebar starts collapsed
- **Overlay mode**: Full-screen overlay when open
- **Touch-friendly**: Large touch targets and smooth animations
- **Auto-close**: Closes on navigation or outside tap

#### Desktop (≥ 1024px)

- **Static positioning**: Sidebar becomes part of layout flow
- **Toggle functionality**: Can be collapsed to save space
- **Persistent state**: Remains open/closed based on user preference
- **Keyboard accessible**: Focus management and keyboard navigation

## 🏢 AppFooter Component

### Features & Content Structure

- **Author Attribution**: Professional branding for Aleksandar Stajic
- **Multi-section Layout**: About, Navigation, Legal, Contact sections
- **CMS-Ready**: Dynamic content integration prepared
- **Social Media**: Configurable social media links
- **Responsive Grid**: Mobile-first responsive layout

### Implementation Structure

```vue
<!-- app/components/layout/AppFooter.vue -->
<script setup lang="ts">
interface FooterContent {
  about: {
    title: string
    description: string
    author: string
  }
  navigation: FooterLink[]
  legal: FooterLink[]
  social: SocialLink[]
}

interface FooterLink {
  label: string
  href: string
}

interface SocialLink {
  platform: string
  url: string
  icon: string
}

const { t } = useI18n()
const localePath = useLocalePath()

// Dynamic footer content with i18n
const footerContent = computed<FooterContent>(() => ({
  about: {
    title: t('footer.about.title'),
    description: t('footer.about.description'),
    author: 'Aleksandar Stajic'
  },
  navigation: [
    {
      label: t('navigation.home'),
      href: localePath('/')
    },
    {
      label: t('navigation.blog'),
      href: localePath('/blog')
    }
    // ... more links
  ],
  legal: [
    {
      label: t('footer.privacy'),
      href: localePath('/privacy')
    },
    {
      label: t('footer.terms'),
      href: localePath('/terms')
    }
  ],
  social: [
    {
      platform: 'GitHub',
      url: 'https://github.com/Aaasaasa',
      icon: 'i-simple-icons-github'
    }
    // ... more social links
  ]
}))

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-6 py-12">
      <!-- Main footer grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About section -->
        <div class="md:col-span-2">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ footerContent.about.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ footerContent.about.description }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('footer.createdBy') }} <strong>{{ footerContent.about.author }}</strong>
          </p>
        </div>

        <!-- Navigation links -->
        <div>
          <h4 class="font-medium mb-4 text-gray-900 dark:text-white">
            {{ t('footer.navigation.title') }}
          </h4>
          <ul class="space-y-2">
            <li v-for="link in footerContent.navigation" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal & Contact -->
        <div>
          <h4 class="font-medium mb-4 text-gray-900 dark:text-white">
            {{ t('footer.legal.title') }}
          </h4>
          <ul class="space-y-2">
            <li v-for="link in footerContent.legal" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Social media & copyright -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            © {{ currentYear }} {{ footerContent.about.author }}. {{ t('footer.rights') }}
          </p>

          <!-- Social links -->
          <div class="flex space-x-4">
            <a
              v-for="social in footerContent.social"
              :key="social.platform"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              :aria-label="social.platform"
            >
              <UIcon :name="social.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
```

## 🔧 Layout Integration Patterns

### State Management

```typescript
// Sidebar state management in layout
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Auto-close on route change
const route = useRoute()
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
```

### Responsive CSS Patterns

```css
/* Sidebar responsive behavior */
.sidebar {
  /* Mobile: fixed overlay */
  position: fixed;
  transform: translateX(-100%);
  transition: transform 300ms ease-in-out;
}

.sidebar.open {
  transform: translateX(0);
}

/* Desktop: static sidebar */
@media (min-width: 1024px) {
  .sidebar {
    position: static;
    transform: translateX(0);
  }

  .sidebar.closed {
    transform: translateX(-100%);
  }
}

/* Content area adjustments */
.main-content {
  flex: 1;
  min-width: 0; /* Prevent flex item overflow */
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 0; /* Adjusted by sidebar state */
  }
}
```

### Accessibility Features

#### Keyboard Navigation

- **Tab Management**: Proper tab order through sidebar items
- **Focus Trapping**: Focus stays within sidebar when open on mobile
- **Escape Key**: Closes sidebar when focused
- **Arrow Keys**: Navigate through sidebar items

#### Screen Reader Support

- **ARIA Labels**: Proper labels for toggle buttons and navigation
- **Role Attributes**: Navigation landmarks and button roles
- **State Announcements**: Screen reader announcements for open/close
- **Skip Links**: Skip to main content functionality

#### Focus Management

```typescript
// Focus management for accessibility
const sidebarRef = ref<HTMLElement>()
const toggleButtonRef = ref<HTMLElement>()

const openSidebar = () => {
  sidebarOpen.value = true
  nextTick(() => {
    // Focus first navigation item when sidebar opens
    const firstLink = sidebarRef.value?.querySelector('a')
    firstLink?.focus()
  })
}

const closeSidebar = () => {
  sidebarOpen.value = false
  // Return focus to toggle button
  toggleButtonRef.value?.focus()
}

// Handle escape key
onKeydown('Escape', () => {
  if (sidebarOpen.value) {
    closeSidebar()
  }
})
```

## 🎨 Theme Integration

### CSS Variable System

The layout components use CSS variables for theming:

```css
:root {
  /* Layout colors */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-secondary: #6b7280;

  /* Primary colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
}

.dark {
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-border: #374151;
  --color-text: #f9fafb;
  --color-text-secondary: #d1d5db;

  --color-primary: #60a5fa;
  --color-primary-hover: #3b82f6;
}
```

### Component Theming

```vue
<template>
  <div
    class="sidebar"
    :style="{
      backgroundColor: 'var(--color-background)',
      borderColor: 'var(--color-border)',
      color: 'var(--color-text)'
    }"
  >
    <!-- Sidebar content with theme variables -->
  </div>
</template>
```

## 🚀 Performance Considerations

### Code Splitting

- Layout components are automatically code-split by Nuxt
- Lazy loading for non-critical sidebar sections
- Optimal bundle size with tree-shaking

### Animation Performance

- CSS transforms for smooth animations
- GPU acceleration with `transform3d`
- Reduced motion respect for accessibility

### Memory Management

- Event listener cleanup on component unmount
- Proper ref management to prevent memory leaks
- Efficient reactive computation with computed properties

## 📚 Usage Examples

### Custom Layout Extension

```vue
<!-- app/layouts/admin.vue - Custom admin layout -->
<template>
  <div class="min-h-screen flex">
    <!-- Reuse AppSidebar with admin-specific items -->
    <AppSidebar v-model="sidebarOpen" :items="adminNavigationItems" variant="admin" />

    <div class="flex-1 flex flex-col">
      <!-- Admin-specific header -->
      <AdminHeader @toggle-sidebar="toggleSidebar" />

      <!-- Admin content -->
      <main class="flex-1 p-6">
        <slot />
      </main>

      <!-- Simplified footer for admin -->
      <AdminFooter />
    </div>
  </div>
</template>
```

### Conditional Sidebar Items

```typescript
// Dynamic navigation based on user role
const navigationItems = computed(() => {
  const baseItems = [{ label: t('nav.home'), href: '/', icon: 'i-lucide-home' }]

  if (user.value?.role === 'admin') {
    baseItems.push({
      label: t('nav.admin'),
      href: '/admin',
      icon: 'i-lucide-settings'
    })
  }

  if (user.value?.role === 'editor') {
    baseItems.push({
      label: t('nav.editor'),
      href: '/editor',
      icon: 'i-lucide-edit'
    })
  }

  return baseItems
})
```

---

**Layout System Summary**: The NuxtWP theme's layout system provides a modern, responsive, and accessible foundation with professional sidebar navigation and footer components. The architecture supports theming, internationalization, and role-based navigation while maintaining excellent performance and user experience across all devices.
