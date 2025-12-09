// app/components/features/LanguageSwitcher.vue

<template>
  <UDropdownMenu v-if="currentLocale" :items="languageMenuItems">
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      icon="i-lucide-globe"
      :label="currentLocale.code.toUpperCase()"
      trailing-icon="i-lucide-chevron-down"
    />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const currentLocale = computed(() => {
  const found = locales.value.find((l) => l.code === locale.value)
  return found || locales.value[0] || null
})

const languageMenuItems = computed<DropdownMenuItem[][]>(() => {
  if (!currentLocale.value) return []

  return [
    [
      {
        label: currentLocale.value.name,
        type: 'label',
        icon: 'i-lucide-globe'
      }
    ],
    locales.value.map((loc) => ({
      label: loc.name,
      icon: locale.value === loc.code ? 'i-lucide-check' : undefined,
      disabled: locale.value === loc.code,
      onSelect: () => {
        setLocale(loc.code)
        navigateTo(switchLocalePath(loc.code))
      }
    }))
  ]
})
</script>
