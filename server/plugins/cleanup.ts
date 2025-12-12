/* eslint-disable no-console */
import prisma from '~~/server/utils/prismaCms'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[CLEANUP] Starting cleanup scheduler')

  // Clean up expired data every hour
  const cleanupInterval = setInterval(
    async () => {
      try {
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // 1. Clean up expired tokens (if model exists)
        try {
          const tokenResult = await (prisma as any).token?.deleteMany({
            where: {
              expiresAt: { lt: now }
            }
          })

          if (tokenResult?.count > 0) {
            console.log(`[CLEANUP] Deleted ${tokenResult.count} expired tokens`)
          }
        } catch (e) {
          // Token model doesn't exist - skip
        }

        // 2. Clean up unverified users older than 24 hours
        try {
          const unverifiedUsers = await prisma.user.findMany({
            where: {
              emailVerified: false,
              createdAt: { lt: twentyFourHoursAgo }
            },
            select: { id: true, email: true }
          })

          if (unverifiedUsers.length > 0) {
            const userResult = await prisma.user.deleteMany({
              where: {
                id: { in: unverifiedUsers.map((u) => u.id) }
              }
            })
            console.log(`[CLEANUP] Deleted ${userResult.count} unverified users`)
          }
        } catch (e) {
          // User model might not have emailVerified field - skip
        }

        // 3. Clean up login attempts (if model exists)
        try {
          const loginResult = await (prisma as any).loginAttempt?.deleteMany({
            where: {
              OR: [
                {
                  // Old entries (>24h)
                  lastAttemptAt: {
                    lt: twentyFourHoursAgo
                  }
                },
                {
                  // Expired blocking entries
                  blockedUntil: {
                    lt: now
                  }
                }
              ]
            }
          })

          if (loginResult?.count > 0) {
            console.log(`[CLEANUP] Deleted ${loginResult.count} expired login attempts`)
          }
        } catch (e) {
          // LoginAttempt model doesn't exist - skip
        }
      } catch (error) {
        console.error('[CLEANUP] Failed to clean up data:', error)
      }
    },
    60 * 60 * 1000
  ) // Every hour

  // Clean up on server shutdown
  nitroApp.hooks.hook('close', () => {
    console.log('[CLEANUP] Stopping cleanup scheduler')
    clearInterval(cleanupInterval)
  })
})
