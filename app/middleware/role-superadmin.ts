/**
 * Superadmin Role Middleware
 *
 * Schützt Routen die nur für Superadmins zugänglich sein sollen.
 * Prüft ob User eingeloggt ist und die SUPERADMIN Rolle hat.
 */

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession()
  const localePath = useLocalePath()

  // Prüfe ob eingeloggt
  if (!loggedIn.value) {
    return navigateTo(localePath('/auth/login'))
  }

  // TODO: Prüfe Superadmin-Rolle wenn User-Type erweitert wird
  // const user = await $fetch('/api/auth/me')
  // if (user.role !== 'SUPERADMIN') {
  //   return navigateTo(localePath('/'))
  // }

  // Für jetzt: Wenn User eingeloggt ist, erlauben
  // (Role-Check muss serverseitig in API implementiert werden)
})
