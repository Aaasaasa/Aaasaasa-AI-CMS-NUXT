<script setup lang="ts">
import AdminNav from '~/components/AdminNav.vue'
import LayoutThemeSwitcher from '~/components/layout/ThemeSwitcher.vue'
import LayoutLanguageSwitcher from '~/components/layout/LanguageSwitcher.vue'
import PreferencesControls from '~/components/layout/PreferencesControls.vue'
const { t } = useI18n()
</script>

<template>
  <header class="border-b bg-white dark:bg-gray-900">
    <UContainer class="flex items-center justify-between h-14">
      <!-- Left: Logo + main nav -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="text-lg font-bold text-primary">Aaasaasa AI CMS NUXT</NuxtLink>
        <nav class="hidden md:flex items-center gap-4 text-sm font-medium">
          <ULink to="/" active-class="text-primary font-semibold">{{ t('Home') }}</ULink>
          <ULink to="/about" active-class="text-primary font-semibold">{{ t('About') }}</ULink>
          <ULink to="/blog" active-class="text-primary font-semibold">{{ t('Blog') }}</ULink>
        </nav>
      </div>

      <!-- Right: actions -->
      <div class="flex items-right gap-6">
        <AdminNav />
        <LayoutLanguageSwitcher />
        <LayoutThemeSwitcher />
        <UModal teleport="#modal-root">
          <UButton icon="i-lucide-settings" color="gray" variant="ghost" />
          <template #body>
            <PreferencesControls />
          </template>
        </UModal>
      </div>
    </UContainer>
  </header>
</template>
