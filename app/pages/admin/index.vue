<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Content Stats Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-5 text-blue-600" />
            <h3 class="font-semibold">Artikel</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Gesamt veröffentlicht</p>
          <p class="text-2xl font-bold">37</p>
        </div>
      </UCard>

      <!-- Pages Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-layout" class="size-5 text-cyan-600" />
            <h3 class="font-semibold">Seiten</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Gesamt</p>
          <p class="text-2xl font-bold">12</p>
        </div>
      </UCard>

      <!-- Media Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-image" class="size-5 text-indigo-600" />
            <h3 class="font-semibold">Media</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Dateien</p>
          <p class="text-2xl font-bold">104</p>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Schnellzugriff</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-file-plus" class="mr-2" />
          Neuer Artikel
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-users" class="mr-2" />
          Benutzer verwalten
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-folder" class="mr-2" />
          Media Library
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-message-square" class="mr-2" />
          Kommentare
        </UButton>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Letzte Aktivitäten</h2>
      <UCard>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Keine Aktivitäten vorhanden</p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-admin',
  layout: 'admin'
})

useHead({
  title: 'Admin Dashboard'
})
</script>
