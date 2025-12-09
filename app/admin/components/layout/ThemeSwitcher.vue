<script setup lang="ts">
import { computed } from 'vue'

const colorMode = useColorMode()

const currentThemeIcon = computed(() => {
  switch (colorMode.preference) {
    case 'dark':
      return 'i-lucide-moon'
    case 'light':
      return 'i-lucide-sun'
    default:
      return 'i-lucide-laptop'
  }
})

const themeItems = [
  {
    label: 'Light',
    icon: 'i-lucide-sun',
    onSelect: () => (colorMode.preference = 'light')
  },
  {
    label: 'Dark',
    icon: 'i-lucide-moon',
    onSelect: () => (colorMode.preference = 'dark')
  },
  {
    label: 'System',
    icon: 'i-lucide-laptop',
    onSelect: () => (colorMode.preference = 'system')
  }
]
</script>

<template>
  <ClientOnly>
    <UDropdownMenu :items="themeItems">
      <UButton color="gray" variant="ghost" :icon="currentThemeIcon" />
    </UDropdownMenu>

    <template #fallback>
      <UButton color="gray" variant="ghost" icon="i-lucide-sun" disabled />
    </template>
  </ClientOnly>
</template>
