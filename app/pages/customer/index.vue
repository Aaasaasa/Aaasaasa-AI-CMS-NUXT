<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Mein Bereich</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" class="size-5 text-green-600" />
            <h3 class="font-semibold">Profil</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
          <p class="text-2xl font-bold text-green-600">Aktiv</p>
        </div>
      </UCard>

      <!-- Orders Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shopping-bag" class="size-5 text-teal-600" />
            <h3 class="font-semibold">Bestellungen</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Gesamt</p>
          <p class="text-2xl font-bold">0</p>
        </div>
      </UCard>

      <!-- Messages Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-mail" class="size-5 text-emerald-600" />
            <h3 class="font-semibold">Nachrichten</h3>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Ungelesen</p>
          <p class="text-2xl font-bold">0</p>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Schnellzugriff</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-user-cog" class="mr-2" />
          Profil bearbeiten
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-lock" class="mr-2" />
          Passwort ändern
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-shopping-cart" class="mr-2" />
          Meine Bestellungen
        </UButton>

        <UButton color="primary" variant="soft" block disabled>
          <UIcon name="i-lucide-heart" class="mr-2" />
          Favoriten
        </UButton>
      </div>
    </div>

    <!-- Account Info -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Account Information</h2>
      <UCard>
        <div class="space-y-3">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Account Typ</p>
            <p class="font-semibold">Standard</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Mitglied seit</p>
            <p class="font-semibold">-</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-customer',
  layout: 'customer'
})

useHead({
  title: 'Mein Bereich'
})
</script>
