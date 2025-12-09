<script setup lang="ts">
import { User, LogOut, LayoutDashboard, FileText, Users } from 'lucide-vue-next'

// i18n route helper
const localePath = useLocalePath()

// mock user data
const user = {
  name: 'Aleksandar',
  email: 'aleksandar@example.com',
  avatar: 'https://i.pravatar.cc/40?u=aleksandar'
}

// main nav links
const nav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Posts', to: '/admin/posts', icon: FileText },
  { label: 'Users', to: '/admin/users', icon: Users }
]

// profile dropdown items
const profileItems = [
  [
    { label: 'Profile', to: '/profile', icon: User },
    { label: 'Sign out', to: '/logout', icon: LogOut }
  ]
]
</script>

<template>
  <nav class="flex items-center gap-8">
    <!-- Main nav links -->
    <div class="hidden md:flex gap-8 text-sm font-medium">
      <ULink
        v-for="item in nav"
        :key="item.to"
        :to="localePath(item.to)"
        active-class="text-primary font-semibold"
        class="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <component :is="item.icon" class="w-4 h-4" />
        <span>{{ item.label }}</span>
      </ULink>
    </div>

    <!-- Profile dropdown -->
    <ClientOnly>
      <UDropdownMenu
        :items="[[{ label: user.name, slot: 'account', disabled: true }], nav, profileItems[0]]"
        class="ml-2"
      >
        <UAvatar :src="user.avatar" size="sm" />

        <!-- slot for account info -->
        <template #account>
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ user.name }}</span>
            <span class="text-xs text-muted-foreground">{{ user.email }}</span>
          </div>
        </template>
      </UDropdownMenu>

      <!-- Fallback when JS is disabled or hydration mismatch -->
      <template #fallback>
        <UButton icon="i-lucide-user" color="gray" variant="ghost" disabled />
      </template>
    </ClientOnly>
  </nav>
</template>
