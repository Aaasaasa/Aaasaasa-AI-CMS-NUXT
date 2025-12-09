<template>
  <div class="min-h-screen flex">
    <!-- Superadmin Sidebar -->
    <AppSidebar v-model="sidebarOpen" />

    <!-- Main Layout -->
    <div class="flex-1 flex flex-col">
      <UMain>
        <UHeader>
          <template #title>
            <div class="flex items-center gap-3">
              <UButton
                icon="i-lucide-menu"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="toggleSidebar"
              />
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-check" class="size-6 text-purple-600" />
                <h1 class="text-xl font-bold">
                  <span class="text-purple-600">Superadmin</span>
                  <span class="text-gray-600 dark:text-gray-400"> Dashboard</span>
                </h1>
              </div>
            </div>
          </template>

          <template #right>
            <!-- User menu -->
            <UDropdownMenu v-if="loggedIn" :items="items">
              <UAvatar alt="Superadmin" size="sm" class="cursor-pointer" />
            </UDropdownMenu>

            <UColorModeButton />
          </template>
        </UHeader>

        <!-- Page Content -->
        <slot />

        <AppFooter />
      </UMain>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppFooter from '~/components/layout/AppFooter.vue'

const { loggedIn, clear } = useUserSession()
const localePath = useLocalePath()
const { success } = useNotifications()
const route = useRoute()

// Sidebar state
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Close sidebar on route change
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)

// Check if user is logged in (role check wird im Middleware gemacht)
onMounted(() => {
  if (!loggedIn.value) {
    navigateTo(localePath('/'))
  }
})

const handleLogout = async () => {
  try {
    clear()
    await $fetch('/api/auth/logout', { method: 'POST' })
    success({
      title: 'Abgemeldet',
      message: 'Sie wurden erfolgreich abgemeldet'
    })
    await navigateTo(localePath('/'))
  } catch {
    clear()
    await navigateTo(localePath('/'))
  }
}

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Superadmin',
      type: 'label'
    }
  ],
  [
    {
      label: 'Abmelden',
      icon: 'i-lucide-log-out',
      onSelect: handleLogout
    }
  ]
])
</script>
