# 🧩 Component Architecture

Modern Vue 3 Composition API components with Nuxt UI integration, featuring responsive layout system and professional component patterns for the NuxtWP Multilang Theme.

## 🏗️ Component Structure

```
app/components/
├── features/                    # Feature-specific components
│   ├── auth/                   # Authentication components
│   ├── blog/                   # Blog and CMS components
│   │   ├── ArticleCard.vue     # Article display components
│   │   ├── CategoryFilter.vue  # Content filtering
│   │   └── TagManager.vue      # Tag management
│   └── admin/                  # Admin dashboard components
├── layout/                     # Layout & Navigation (NEW v1.0)
│   ├── AppSidebar.vue         # Modern sidebar navigation
│   ├── AppFooter.vue          # Professional footer component
│   └── PreferencesControls.vue # User preferences
└── ui/                        # Reusable UI components
    ├── form/                  # Form field components
    │   ├── Input.vue
    │   ├── Email.vue
    │   ├── Password.vue
    │   └── Textarea.vue
    ├── navigation/            # Navigation components
    └── content/              # Content display components
```

### Layout Components (New in v1.0)

#### AppSidebar.vue

- **Mobile-first design** with hamburger menu and overlay
- **Desktop panel mode** with toggle functionality
- **Multi-language navigation** with i18n integration
- **Admin section** for authenticated users
- **Auto-close behavior** on route changes and outside clicks

#### AppFooter.vue

- **Author attribution** (Aleksandar Stajic) with professional branding
- **CMS-ready structure** with dynamic content sections
- **Social media integration** with configurable links
- **Legal sections** (Privacy, Terms, Copyright)
- **Responsive grid layout** with mobile optimization

## 🎯 Component Patterns

### 1. Layout Component Pattern

**Modern Responsive Layout with Sidebar Integration**

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="min-h-screen flex">
    <!-- Sidebar Component -->
    <AppSidebar v-model="sidebarOpen" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <UMain>
        <UHeader>
          <!-- Sidebar toggle button -->
          <template #title>
            <div class="flex items-center">
              <UButton icon="i-lucide-menu" @click="toggleSidebar" class="mr-3" />
              <h1>{{ appName }}</h1>
            </div>
          </template>
        </UHeader>

        <!-- Page Content -->
        <slot />

        <!-- Modern Footer -->
        <AppFooter />
      </UMain>
    </div>
  </div>
</template>

<script setup lang="ts">
// Explicit imports for layout components
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppFooter from '~/components/layout/AppFooter.vue'

const sidebarOpen = ref(false)
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value)
</script>
```

### 2. Sidebar Navigation Pattern

**Responsive Sidebar with Mobile/Desktop Modes**

```vue
<!-- app/components/layout/AppSidebar.vue -->
<template>
  <div>
    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 lg:hidden z-40"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar Panel -->
    <aside
      :class="[
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-900',
        'lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      style="width: 280px"
    >
      <!-- Navigation Items -->
      <nav class="p-4 space-y-2">
        <UButton
          v-for="item in navigationItems"
          :key="item.href"
          :to="item.href"
          :icon="item.icon"
          class="w-full justify-start"
          @click="sidebarOpen = false"
        >
          {{ item.label }}
        </UButton>
      </nav>
    </aside>
  </div>
</template>
```

### 3. Footer Component Pattern

**Professional Footer with Author Attribution**

```vue
<!-- app/components/layout/AppFooter.vue -->
<template>
  <footer class="bg-gray-50 dark:bg-gray-900 border-t">
    <div class="container mx-auto px-6 py-12">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About Section -->
        <div class="md:col-span-2">
          <h3 class="text-lg font-semibold mb-4">About NuxtWP</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            A modern multilingual WordPress-inspired theme built with Nuxt 4.
          </p>
          <p class="text-sm text-gray-500">Created by <strong>Aleksandar Stajic</strong></p>
        </div>

        <!-- Navigation Links -->
        <div>
          <h4 class="font-medium mb-4">Navigation</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="link in footerLinks" :key="link.href">
              <NuxtLink :to="link.href" class="hover:text-primary-600">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-8 pt-8 border-t text-center">
        <p class="text-sm text-gray-500">
          © {{ currentYear }} Aleksandar Stajic. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
```

### 4. Props & Events Pattern

**Type-safe Component Communication**

```vue
<script setup lang="ts">
interface Props {
  modelValue?: boolean
  items?: NavigationItem[]
  variant?: 'default' | 'compact'
}

interface NavigationItem {
  label: string
  href: string
  icon: string
  badge?: string
  children?: NavigationItem[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  navigate: [item: NavigationItem]
}>()
</script>
```

### 5. Composable Integration Pattern

**Reactive State Management with Composables**

```vue
<script setup lang="ts">
// Authentication state
const { loggedIn, user } = useUserSession()

// Internationalization
const { t, locale } = useI18n()
const localePath = useLocalePath()

// Route reactivity
const route = useRoute()

// Close sidebar on route change
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)

// Navigation items with i18n
const navigationItems = computed(() => [
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
])
</script>
```

## 🎨 Component Categories

### Display Components

**Implementation**: See `app/components/features/post/Card.vue` for complete post display component with Nuxt UI integration.

**Features:**

- ✅ **Nuxt UI Pro v4 integration** with UCard, UButton, UDropdownMenu
- ✅ **Overlay system** with useOverlay() for modal management
- ✅ **Consistent styling** with primary/secondary color scheme
- ✅ **Micro-interactions** with hover effects and transitions

### Modal Components

**Implementation**: See `app/components/features/post/CreateModal.vue` for complete modal component with form integration.

**Features:**

- ✅ **UAuthForm integration** for consistent form patterns
- ✅ **Composable-driven** with usePostForm, useLoginForm, useRegisterForm
- ✅ **Overlay management** with useOverlay() for better UX
- ✅ **Real-time analytics** with character count, word count, reading time

### Form Field Components

**Implementation**: See `app/components/ui/form/` directory for consistent field component patterns with UFormField integration.

## 🎭 Styling Patterns

### Nuxt UI Pro v4 Integration

**Implementation**: See components for consistent color and variant usage patterns with Nuxt UI components.

### Responsive Design

**Implementation**: Components follow mobile-first responsive design with Tailwind CSS utilities and dark mode support.

### Dark Mode Support

**Implementation**: All components include dark mode variants using Tailwind's dark: prefix classes.

## 🔧 State Management

### Local State

**Implementation**: Components use Vue's reactive refs and reactive objects for local state management.

### Computed Properties

**Implementation**: Components leverage Vue's computed properties for reactive derived state and dynamic content.

### Watchers

**Implementation**: Components use Vue watchers for reactive state updates based on prop changes and external data.

## 🚀 Best Practices

### Component Organization

1. **Single Responsibility** - Each component has one clear purpose
2. **Composition over Inheritance** - Use composables for shared logic
3. **Props Down, Events Up** - Unidirectional data flow
4. **Type Safety** - Always use TypeScript interfaces

### Performance

1. **Lazy Loading** - Use `defineAsyncComponent` for heavy components
2. **v-memo** - Cache expensive template computations
3. **Computed Caching** - Leverage Vue's computed property caching
4. **Event Cleanup** - Remove event listeners in `onUnmounted`

### Accessibility

1. **Semantic HTML** - Use proper HTML elements
2. **ARIA Labels** - Provide accessible labels
3. **Focus Management** - Handle focus for modals and forms
4. **Color Contrast** - Ensure sufficient contrast ratios

### Testing

1. **Test IDs** - Add `data-testid` for reliable selection
2. **Event Testing** - Test component events and interactions
3. **Snapshot Testing** - Capture component output changes
4. **Integration Testing** - Test component interactions

## 📚 Resources

- [Vue 3 Composition API](https://vuejs.org/api/composition-api-setup.html)
- [Nuxt UI Pro v4 Components](https://ui4.nuxt.com/components)
- [Nuxt UI Pro v4 Auth Components](https://ui4.nuxt.com/docs/components/auth-form)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
