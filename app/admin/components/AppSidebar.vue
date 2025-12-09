<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'nuxt/app'
import { Home, Bot, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'

// dodano: localePath helper iz i18n
const localePath = useLocalePath()

const collapsed = ref(false)
const route = useRoute()

const nav = [
  { to: '/', label: 'Dashboard', icon: Home },
  {
    to: '/aaasaasa_cms',
    label: 'Nuxt 4 + Tailwind CSS + Prisma ORM Architecture & Development Process',
    icon: Bot
  },
  {
    to: '/aaasaasa_cms/request-flow',
    label: 'Nuxt 4 Request Flow',
    icon: Settings
  },
  {
    to: '/aaasaasa_cms/nuxt-4-request-rlow-detailed-architecture-explanation',
    label: 'Nuxt 4 Request Flow: Detailed Architecture Explanation',
    icon: Settings
  },
  { to: '/about', label: 'About', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings }
]

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <aside
    :class="[
      'h-screen border-r bg-white dark:bg-gray-900 transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    ]"
  >
    <!-- Header -->
    <div class="h-14 flex items-center justify-between px-3">
      <span v-if="!collapsed" class="font-semibold text-primary">Admin</span>
      <UButton
        color="gray"
        variant="outline"
        size="xs"
        icon
        :title="collapsed ? 'Expand' : 'Collapse'"
        @click="collapsed = !collapsed"
      >
        <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" class="w-4 h-4" />
      </UButton>
    </div>

    <USeparator />

    <!-- Scrollable nav -->
    <div class="h-[calc(100vh-56px)] overflow-y-auto">
      <nav class="p-2 space-y-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="localePath(item.to)"
          class="group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          :class="
            isActive(item.to)
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
        >
          <!-- Tooltip samo kad je collapsed -->
          <UTooltip v-if="collapsed" :text="item.label" placement="right">
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
          </UTooltip>

          <component :is="item.icon" v-else class="w-5 h-5 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </aside>
</template>
