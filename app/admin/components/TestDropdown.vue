<script setup lang="ts">
const items = [
  [
    { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
  ],
  [{ label: 'Sign out', icon: 'i-lucide-log-out', to: '/logout' }]
]
</script>

<template>
  <ClientOnly>
    <UDropdownMenu :items="items">
      <UButton color="gray" variant="ghost" icon="i-lucide-user" />
    </UDropdownMenu>

    <template #fallback>
      <UButton color="gray" variant="ghost" icon="i-lucide-user" disabled />
    </template>
  </ClientOnly>
</template>
