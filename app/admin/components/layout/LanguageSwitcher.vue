<script setup lang="ts">
import { computed } from 'vue'

const { locale, locales, setLocale } = useI18n()

const currentLocaleIcon = computed(() => {
  const current = locales.value.find((l) => l.code === locale.value)
  return (current as any)?.flag || 'i-lucide-languages'
})

const languageItems = computed(() =>
  locales.value.map((lang) => ({
    label: lang.name || lang.code,
    icon: (lang as any).flag || 'i-lucide-languages',
    onSelect: () => setLocale(lang.code) // 👈 ključno: UDropdownMenu koristi `onSelect`, ne `click`
  }))
)
</script>

<template>
  <ClientOnly>
    <UDropdownMenu :items="languageItems">
      <UButton color="neutral" variant="ghost" :icon="currentLocaleIcon" />
    </UDropdownMenu>

    <template #fallback>
      <UButton color="neutral" variant="ghost" icon="i-lucide-languages" disabled />
    </template>
  </ClientOnly>
</template>
