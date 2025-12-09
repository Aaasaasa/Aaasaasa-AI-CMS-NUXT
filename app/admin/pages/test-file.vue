<template>
  <div>
    <div class="p-10">
      <UDropdownMenu :items="items">
        <UButton label="Open Menu" color="gray" />
      </UDropdownMenu>
    </div>

    <div class="p-8">
      <h1 class="text-xl font-bold mb-4">Test Dropdown</h1>
      <TestDropdown />
    </div>
  </div>
</template>

<script setup lang="ts">
import TestDropdown from '~/components/TestDropdown.vue'

const items = [
  [{ label: 'Option A', icon: 'i-lucide-sun' }],
  [{ label: 'Option B', icon: 'i-lucide-moon' }]
]
</script>
