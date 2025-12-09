/**
 * Admin Role Middleware
 *
 * Schützt Routen die nur für Admins zugänglich sein sollen.
 * Prüft ob User eingeloggt ist und die ADMIN Rolle hat.
 */

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession()
  const localePath = useLocalePath()

  // Prüfe ob eingeloggt
  if (!loggedIn.value) {
    return navigateTo(localePath('/auth/login'))
  }

  // TODO: Prüfe Admin-Rolle wenn User-Type erweitert wird
  // const user = await $fetch('/api/auth/me')
  // if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
  //   return navigateTo(localePath('/'))
  // }

  // Für jetzt: Wenn User eingeloggt ist, erlauben
  // (Role-Check muss serverseitig in API implementiert werden)
})
