<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t bg-white dark:bg-gray-900 mt-auto">
    <UContainer class="py-6 md:py-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <!-- Left: Branding & Copy -->
        <div class="flex flex-col gap-2 text-sm text-muted-foreground">
          <span class="font-semibold text-foreground">NuxtWP Admin</span>
          <span
            >© {{ year }}
            <a
              href="https://stajic.de"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary transition-colors font-medium"
            >
              Aleksandar Stajic
            </a>
          </span>
        </div>

        <!-- Center: Admin Navigation links -->
        <nav class="flex gap-4 text-sm text-muted-foreground">
          <ULink to="/admin/dashboard" active-class="text-primary font-medium">Dashboard</ULink>
          <ULink to="/admin/posts" active-class="text-primary font-medium">Posts</ULink>
          <ULink to="/admin/settings" active-class="text-primary font-medium">Settings</ULink>
          <ULink to="/help" active-class="text-primary font-medium">Help</ULink>
        </nav>

        <!-- Right: Social & Links -->
        <div class="flex items-center gap-4">
          <a
            href="https://github.com/Aaasaasa/nuxt-wp-multilang-theme"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            class="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon name="i-lucide-github" class="w-5 h-5" />
          </a>
          <a
            href="https://stajic.de"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            class="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon name="i-lucide-globe" class="w-5 h-5" />
          </a>
          <NuxtLink
            to="/"
            aria-label="Frontend"
            class="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon name="i-lucide-external-link" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>

      <!-- Developer Attribution -->
      <div class="mt-4 pt-4 border-t border-muted text-center">
        <p class="text-xs text-muted-foreground">
          Created by
          <a
            href="https://stajic.de"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium hover:text-primary transition-colors"
          >
            Aleksandar Stajic
          </a>
          •
          <a
            href="https://github.com/Aaasaasa"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-primary transition-colors"
          >
            GitHub
          </a>
          • Made with ❤️ in Germany
        </p>
      </div>
    </UContainer>
  </footer>
</template>
