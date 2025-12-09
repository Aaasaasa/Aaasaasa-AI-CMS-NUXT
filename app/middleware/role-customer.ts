/**
 * Customer Role Middleware
 *
 * Schützt Routen die nur für eingeloggte Kunden zugänglich sein sollen.
 * Prüft ob User eingeloggt ist.
 */

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession()
  const localePath = useLocalePath()

  // Prüfe ob eingeloggt
  if (!loggedIn.value) {
    return navigateTo(localePath('/auth/login'))
  }

  // Kunden brauchen nur eingeloggt zu sein
  // Alle eingeloggten User können auf Kunden-Bereich zugreifen
})
