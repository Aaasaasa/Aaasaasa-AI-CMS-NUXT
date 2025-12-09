<script setup lang="ts">
interface FooterContent {
  branding: {
    name: string
    tagline?: string
  }
  author: {
    name: string
    website: string
    github: string
  }
  sections: {
    title: string
    links: {
      label: string
      href: string
      external?: boolean
    }[]
  }[]
  social: {
    platform: string
    url: string
    icon: string
  }[]
  legal: {
    label: string
    href: string
  }[]
}

// This will later come from CMS/Backend API
const footerContent: FooterContent = {
  branding: {
    name: 'Aaasaasa Nuxt 4 CMS Theme created by Aleksandar Stajić',
    tagline: 'Modern multilingual CMS with Nuxt & WordPress migration'
  },
  author: {
    name: 'Aleksandar Stajic',
    website: 'https://stajic.de',
    github: 'https://github.com/Aaasaasa'
  },
  sections: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Blog', href: '/blog' },
        { label: 'Changelog', href: '/changelog' }
      ]
    },
    {
      title: 'Resources',
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/Aaasaasa/Aaasaasa-AI-CMS-NUXT',
          external: true
        },
        { label: 'Demo', href: '/demo' },
        { label: 'Examples', href: '/examples' },
        { label: 'Community', href: '/community' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact', href: '/contact' },
        { label: 'Status', href: '/status' },
        {
          label: 'Report Issues',
          href: 'https://github.com/Aaasaasa/Aaasaasa-AI-CMS-NUXT/issues',
          external: true
        }
      ]
    }
  ],
  social: [
    {
      platform: 'GitHub',
      url: 'https://github.com/Aaasaasa',
      icon: 'i-lucide-github'
    },
    {
      platform: 'Website',
      url: 'https://stajic.de',
      icon: 'i-lucide-globe'
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/Aaasaasa',
      icon: 'i-lucide-twitter'
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/aleksandar-stajic',
      icon: 'i-lucide-linkedin'
    }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Imprint', href: '/imprint' }
  ]
}

const currentYear = new Date().getFullYear()
// const { locale } = useI18n() // For future multilingual support
</script>

<template>
  <footer class="footer-main">
    <UContainer class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-grid">
        <!-- Branding Section -->
        <div class="footer-section lg:col-span-1">
          <div class="mb-6">
            <h3 class="footer-title">{{ footerContent.branding.name }}</h3>
            <p
              v-if="footerContent.branding.tagline"
              class="text-muted-foreground text-sm leading-relaxed"
            >
              {{ footerContent.branding.tagline }}
            </p>
          </div>

          <!-- Author Info -->
          <div class="space-y-2 text-sm">
            <p class="text-muted-foreground">
              {{ $t('footer.createdBy', 'Created by') }}
            </p>
            <p class="font-medium text-foreground">
              <a
                :href="footerContent.author.website"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary transition-colors"
              >
                {{ footerContent.author.name }}
              </a>
            </p>
            <p class="text-xs text-muted-foreground">
              <a
                :href="footerContent.author.github"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary transition-colors"
              >
                <Icon name="i-lucide-github" class="inline w-3 h-3 mr-1" />
                GitHub Profile
              </a>
            </p>
          </div>
        </div>

        <!-- Dynamic Sections -->
        <div v-for="section in footerContent.sections" :key="section.title" class="footer-section">
          <h4 class="footer-title">{{ section.title }}</h4>
          <nav class="footer-links">
            <template v-for="link in section.links" :key="link.href">
              <NuxtLink v-if="!link.external" :to="link.href" class="footer-link">
                {{ link.label }}
              </NuxtLink>
              <a
                v-else
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link inline-flex items-center"
              >
                {{ link.label }}
                <Icon name="i-lucide-external-link" class="w-3 h-3 ml-1" />
              </a>
            </template>
          </nav>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <!-- Copyright & Author -->
        <div class="footer-copyright">
          <p class="mb-2">
            © {{ currentYear }}
            <a
              :href="footerContent.author.website"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium hover:text-primary transition-colors"
            >
              {{ footerContent.author.name }}
            </a>
          </p>
          <p class="text-xs">
            {{ $t('footer.allRightsReserved', 'All rights reserved.') }}
            {{ $t('footer.poweredBy', 'Powered by Nuxt 4.') }}
          </p>
        </div>

        <!-- Right Side: Social & Legal -->
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Social Links -->
          <div class="footer-social">
            <a
              v-for="social in footerContent.social"
              :key="social.platform"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-social-link"
              :title="social.platform"
            >
              <Icon :name="social.icon" class="w-5 h-5" />
            </a>
          </div>

          <!-- Legal Links -->
          <nav class="footer-legal-links">
            <NuxtLink
              v-for="legal in footerContent.legal"
              :key="legal.href"
              :to="legal.href"
              class="hover:text-primary transition-colors"
            >
              {{ legal.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>

      <!-- Developer Attribution (Always visible) -->
      <div class="mt-6 pt-4 border-t border-muted text-center">
        <p class="text-xs text-muted-foreground">
          {{ $t('footer.developedBy', 'Developed by') }}
          <a
            href="https://stajic.de"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium hover:text-primary transition-colors mx-1"
          >
            Aleksandar Stajic
          </a>
          •
          <a
            href="https://github.com/Aaasaasa"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-primary transition-colors mx-1"
          >
            <Icon name="i-lucide-github" class="inline w-3 h-3 mr-1" />
            GitHub
          </a>
          •
          <span class="mx-1"
            >{{ $t('footer.madeWith', 'Made with') }} ❤️
            {{ $t('footer.inGermany', 'in Germany') }}</span
          >
        </p>
      </div>
    </UContainer>
  </footer>
</template>

<!--
Note: This component is designed to be CMS-ready
In the future, the footerContent object will be fetched from:
- Backend API endpoint (e.g., /api/cms/footer)
- Database configuration
- Admin panel settings

For now it uses static data, but the structure supports dynamic content
-->
