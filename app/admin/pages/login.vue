<template>
  <UContainer class="flex items-center justify-center min-h-screen">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          {{ t('login.title') }}
        </h1>
      </template>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <UFormGroup :label="t('login.email')">
          <UInput v-model="email" type="email" placeholder="admin@example.com" required />
        </UFormGroup>

        <UFormGroup :label="t('login.password')">
          <UInput v-model="password" type="password" placeholder="••••••••" required />
        </UFormGroup>

        <UButton type="submit" block color="primary" :loading="loading">
          {{ t('login.submit') }}
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          {{ t('login.hint') }}
        </p>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  // Fake auth — postavi user u global state
  const user = useState('authUser')
  user.value = { id: 1, name: 'Admin', email: email.value }

  // Redirect na dashboard
  await navigateTo('/')
}
</script>
