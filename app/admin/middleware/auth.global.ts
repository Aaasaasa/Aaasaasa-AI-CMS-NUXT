// app/admin/middleware/auth.ts
import sharedAuthGuard from '@@shared/middleware/auth.ts'
import { defineNuxtRouteMiddleware, useState, useNuxtApp, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const nuxtApp = useNuxtApp()
  const stateUser = useState('authUser', () => null)

  const fetcher = (p: RequestInfo | string, init?: RequestInit) => {
    // Nutze Nuxt $fetch wenn verfügbar, sonst global fetch

    const _fetch = nuxtApp?.$fetch ?? globalThis.fetch
    return _fetch(p as any, init as any)
  }

  return await sharedAuthGuard(to, {
    fetcher,
    navigateTo: (p: string, opts?: any) => navigateTo(p, opts),
    getUser: () => nuxtApp?.$auth?.user ?? stateUser.value
  })
})

/*export default defineNuxtRouteMiddleware((to) => {
  const user = useState('authUser', () => null) // globalni state za usera

  // Ako nisi logovan i nisi na login strani → redirect
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Ako si logovan i pokušaš na login → redirect na dashboard
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
*/
/*
const user = useState('authUser')
user.value = { id: 1, name: 'Admin' }
*/
/*

// app/admin/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  return import('../../shared/middleware/auth').then(m => m.default(to, from))
})

*/
