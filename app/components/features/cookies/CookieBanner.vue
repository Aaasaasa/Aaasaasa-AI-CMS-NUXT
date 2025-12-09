<template>
  <div v-if="showBanner" class="cookie-banner">
    <!-- Backdrop -->
    <div class="cookie-banner__backdrop"></div>

    <!-- Banner Content -->
    <div class="cookie-banner__container">
      <div class="cookie-banner__content">
        <!-- Header -->
        <div class="cookie-banner__header">
          <Icon name="i-lucide-cookie" class="cookie-banner__icon" />
          <h3 class="cookie-banner__title">
            {{ cookiePolicy?.title || 'Cookie-Einstellungen' }}
          </h3>
        </div>

        <!-- Description -->
        <div class="cookie-banner__description">
          <p>
            {{
              cookiePolicy?.bannerText ||
              'Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.'
            }}
          </p>
        </div>

        <!-- Categories (if detailed view) -->
        <div v-if="showDetails" class="cookie-banner__categories">
          <div v-for="category in cookieCategories" :key="category.id" class="cookie-category">
            <label class="cookie-category__label">
              <input
                v-model="selectedCategories[category.key]"
                type="checkbox"
                :disabled="category.required"
                class="cookie-category__checkbox"
              />
              <div class="cookie-category__info">
                <span class="cookie-category__name">{{ category.name }}</span>
                <span v-if="category.required" class="cookie-category__required">
                  (Erforderlich)
                </span>
                <p v-if="category.description" class="cookie-category__description">
                  {{ category.description }}
                </p>
              </div>
            </label>

            <!-- Cookie Details -->
            <div v-if="showCookieDetails && category.cookies.length" class="cookie-list">
              <details class="cookie-list__details">
                <summary class="cookie-list__summary">
                  {{ category.cookies.length }} Cookie(s) anzeigen
                </summary>
                <div class="cookie-list__content">
                  <div v-for="cookie in category.cookies" :key="cookie.id" class="cookie-item">
                    <h4 class="cookie-item__name">{{ cookie.name }}</h4>
                    <p class="cookie-item__purpose">{{ cookie.purpose }}</p>
                    <div class="cookie-item__meta">
                      <span v-if="cookie.provider" class="cookie-item__provider">
                        Anbieter: {{ cookie.provider }}
                      </span>
                      <span v-if="cookie.duration" class="cookie-item__duration">
                        Dauer: {{ cookie.duration }}
                      </span>
                      <span v-if="cookie.domain" class="cookie-item__domain">
                        Domain: {{ cookie.domain }}
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="cookie-banner__actions">
          <!-- Primary Actions -->
          <div class="cookie-banner__primary-actions">
            <button
              class="cookie-banner__button cookie-banner__button--accept"
              @click="handleAcceptAll"
            >
              {{ cookiePolicy?.acceptText || 'Alle akzeptieren' }}
            </button>

            <button
              class="cookie-banner__button cookie-banner__button--reject"
              @click="handleRejectAll"
            >
              {{ cookiePolicy?.rejectText || 'Alle ablehnen' }}
            </button>
          </div>

          <!-- Secondary Actions -->
          <div class="cookie-banner__secondary-actions">
            <button
              v-if="!showDetails"
              class="cookie-banner__button cookie-banner__button--settings"
              @click="showDetails = true"
            >
              {{ cookiePolicy?.settingsText || 'Einstellungen' }}
            </button>

            <button
              v-if="showDetails"
              class="cookie-banner__button cookie-banner__button--save"
              @click="handleSaveSettings"
            >
              Auswahl speichern
            </button>

            <button
              v-if="showDetails"
              class="cookie-banner__button cookie-banner__button--toggle"
              @click="toggleCookieDetails"
            >
              {{ showCookieDetails ? 'Details ausblenden' : 'Details anzeigen' }}
            </button>
          </div>
        </div>

        <!-- Links -->
        <div class="cookie-banner__links">
          <NuxtLink to="/privacy" class="cookie-banner__link"> Datenschutzerklärung </NuxtLink>
          <NuxtLink to="/cookies" class="cookie-banner__link"> Cookie-Richtlinie </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  position?: 'bottom' | 'top' | 'center'
  theme?: 'light' | 'dark' | 'auto'
}

const _props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  theme: 'auto'
})

const cookieManager = useCookieManager()

// Local state
const showDetails = ref(false)
const showCookieDetails = ref(false)
const selectedCategories = ref<Record<string, boolean>>({})

// Computed
const showBanner = computed(() => cookieManager.showBanner.value)
const cookiePolicy = computed(() => cookieManager.cookiePolicy.value)
const cookieCategories = computed(() => cookieManager.cookieCategories.value)

// Initialize selected categories when categories load
watch(
  cookieCategories,
  (categories) => {
    if (categories.length && Object.keys(selectedCategories.value).length === 0) {
      categories.forEach((category: any) => {
        selectedCategories.value[category.key] = category.required
      })
    }
  },
  { immediate: true }
)

// Methods
const handleAcceptAll = async () => {
  await cookieManager.acceptAll()
  showDetails.value = false
}

const handleRejectAll = async () => {
  await cookieManager.rejectAll()
  showDetails.value = false
}

const handleSaveSettings = async () => {
  await cookieManager.saveConsent(selectedCategories.value)
  showDetails.value = false
}

const toggleCookieDetails = () => {
  showCookieDetails.value = !showCookieDetails.value
}

// Initialize on mount
onMounted(() => {
  cookieManager.initialize()
})
</script>

<style scoped>
/* Cookie Banner Base Styles */
.cookie-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.cookie-banner__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.cookie-banner__container {
  position: relative;
  max-width: 42rem;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: cookie-banner-enter 0.3s ease-out;
}

.cookie-banner__content {
  padding: 1.5rem;
}

.cookie-banner__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.cookie-banner__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #f59e0b;
}

.cookie-banner__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.cookie-banner__description {
  margin-bottom: 1.5rem;
  color: #4b5563;
  line-height: 1.6;
}

/* Categories */
.cookie-banner__categories {
  margin-bottom: 1.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.cookie-category {
  margin-bottom: 1rem;
}

.cookie-category__label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.cookie-category__checkbox {
  margin-top: 0.125rem;
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.cookie-category__checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cookie-category__info {
  flex: 1;
}

.cookie-category__name {
  font-weight: 600;
  color: #111827;
}

.cookie-category__required {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
}

.cookie-category__description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Cookie Details */
.cookie-list {
  margin-top: 0.5rem;
  margin-left: 1.75rem;
}

.cookie-list__details {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.cookie-list__summary {
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
}

.cookie-list__summary:hover {
  background: #f3f4f6;
}

.cookie-list__content {
  padding: 0.75rem;
  background: white;
}

.cookie-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.cookie-item:last-child {
  border-bottom: none;
}

.cookie-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.cookie-item__purpose {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.5rem 0;
}

.cookie-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Actions */
.cookie-banner__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cookie-banner__primary-actions {
  display: flex;
  gap: 0.75rem;
}

.cookie-banner__secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cookie-banner__button {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  min-width: 0;
}

.cookie-banner__button--accept {
  background: #3b82f6;
  color: white;
  flex: 1;
}

.cookie-banner__button--accept:hover {
  background: #2563eb;
}

.cookie-banner__button--reject {
  background: #6b7280;
  color: white;
  flex: 1;
}

.cookie-banner__button--reject:hover {
  background: #4b5563;
}

.cookie-banner__button--settings {
  background: transparent;
  color: #4b5563;
  border-color: #d1d5db;
  flex: 1;
}

.cookie-banner__button--settings:hover {
  background: #f9fafb;
  color: #111827;
}

.cookie-banner__button--save {
  background: #10b981;
  color: white;
  flex: 1;
}

.cookie-banner__button--save:hover {
  background: #059669;
}

.cookie-banner__button--toggle {
  background: transparent;
  color: #6b7280;
  border: none;
  font-size: 0.75rem;
  padding: 0.5rem;
}

.cookie-banner__button--toggle:hover {
  color: #374151;
}

/* Links */
.cookie-banner__links {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.cookie-banner__link {
  font-size: 0.75rem;
  color: #6b7280;
  text-decoration: underline;
}

.cookie-banner__link:hover {
  color: #374151;
}

/* Dark Mode */
.dark .cookie-banner__container {
  background: #1f2937;
  color: #f9fafb;
}

.dark .cookie-banner__title {
  color: #f9fafb;
}

.dark .cookie-banner__description {
  color: #d1d5db;
}

.dark .cookie-banner__categories {
  border-top-color: #374151;
}

.dark .cookie-category__name {
  color: #f9fafb;
}

.dark .cookie-category__description {
  color: #9ca3af;
}

.dark .cookie-list__details {
  border-color: #374151;
}

.dark .cookie-list__summary {
  background: #374151;
  color: #d1d5db;
  border-bottom-color: #4b5563;
}

.dark .cookie-list__summary:hover {
  background: #4b5563;
}

.dark .cookie-list__content {
  background: #1f2937;
}

.dark .cookie-item__name {
  color: #f9fafb;
}

.dark .cookie-item__purpose {
  color: #d1d5db;
}

.dark .cookie-banner__links {
  border-top-color: #374151;
}

.dark .cookie-banner__link {
  color: #9ca3af;
}

.dark .cookie-banner__link:hover {
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 640px) {
  .cookie-banner {
    padding: 0.5rem;
  }

  .cookie-banner__container {
    max-height: 95vh;
  }

  .cookie-banner__content {
    padding: 1rem;
  }

  .cookie-banner__primary-actions {
    flex-direction: column;
  }

  .cookie-banner__secondary-actions {
    flex-direction: column;
  }

  .cookie-banner__links {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}

/* Animations */
@keyframes cookie-banner-enter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Position variations */
.cookie-banner--bottom {
  align-items: flex-end;
}

.cookie-banner--top {
  align-items: flex-start;
}
</style>
