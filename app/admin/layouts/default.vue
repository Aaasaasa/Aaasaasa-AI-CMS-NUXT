<!-- layouts/default.vue -->
<template>
  <div class="grid grid-cols-[auto_1fr] min-h-screen">
    <UTooltip>
      <div class="flex">
        <AppSidebar />
        <!--
        <div class="flex-1">
          <NuxtPage />
        </div>
        -->
      </div>
    </UTooltip>
    <div class="flex flex-col">
      <AppHeader />

      <main class="p-0">
        <slot />
      </main>
      <p class="text-neutral-600 dark:text-neutral-400 text-center">
        <AppFooter />
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import AdminNav from "@/components/AdminNav.vue";
import AppSidebar from '~/components/AppSidebar.vue'
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
//import LayoutThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
// import LayoutLanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import { useI18n, useHead } from '#imports'
// import {  } from '#imports'
const config = useRuntimeConfig()

const { data: _menu } = await useFetch(`${config.public.apiBase}/wp/menu`, {
  query: { slug: 'main-menu' }
})

// import { useHead } from '@unhead/vue'
const { t } = useI18n()

useHead({
  title: t('app.name'),
  meta: [
    { name: 'description', content: t('app.description') },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>
