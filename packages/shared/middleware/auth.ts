// shared/middleware/auth.ts
export type AuthHelpers = {
  fetcher: (input: RequestInfo | string, init?: RequestInit) => Promise<any>
  navigateTo: (path: string, opts?: any) => any
  getUser: () => any | null
}

/**
 * Framework-agnostische Auth-Guard-Funktion.
 * Keine Importe von 'nuxt/*' hier — die App übergibt die benötigten Helpers.
 */
export async function sharedAuthGuard(to: any, helpers: AuthHelpers) {
  const { fetcher, navigateTo, getUser } = helpers
  const user = getUser?.()

  // Nicht eingeloggt -> Login (nur Beispiel für Admin-Routen)
  if (!user && to?.path?.startsWith?.('/admin')) {
    return navigateTo('/login')
  }

  // Beispiel: Rollen-/Verifizierungscheck über API
  if (to?.path?.startsWith?.('/admin')) {
    try {
      const res = await fetcher('/api/auth/verify', {
        method: 'GET',
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
      })
      const role = (res as any)?.role
      if (!['admin', 'superadmin'].includes(role)) {
        return navigateTo('/forbidden', { replace: true })
      }
    } catch {
      return navigateTo('/login', { replace: true })
    }
  }

  return true
}

export default sharedAuthGuard
// ...existing code...
/*
export function sharedAuthGuard(to: any, from: any) {
  const user = useState('authUser', () => null)

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
}
  */
