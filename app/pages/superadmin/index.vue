<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Superadmin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- System Stats Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="size-5 text-purple-600" />
            <h3 class="font-semibold">System Status</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Server läuft</p>
          <p class="text-2xl font-bold text-green-600">Online</p>
        </div>
      </UCard>

      <!-- Users Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="size-5 text-blue-600" />
            <h3 class="font-semibold">Benutzer</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Gesamt registriert</p>
          <p class="text-2xl font-bold">-</p>
        </div>
      </UCard>

      <!-- Database Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-database" class="size-5 text-indigo-600" />
            <h3 class="font-semibold">Datenbanken</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Verbunden</p>
          <p class="text-2xl font-bold text-green-600">3/3</p>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Schnellzugriff</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton to="/api/dev/db-health" target="_blank" color="primary" variant="soft" block>
          <UIcon name="i-lucide-heart-pulse" class="mr-2" />
          DB Health Check
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-users-cog" class="mr-2" />
          Benutzerverwaltung
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-settings" class="mr-2" />
          System Settings
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-file-text" class="mr-2" />
          Logs anzeigen
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-superadmin',
  layout: 'superadmin'
})

useHead({
  title: 'Superadmin Dashboard'
})
</script>
