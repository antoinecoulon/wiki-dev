// /api/_auth/** : endpoints internes de nuxt-auth-utils (lecture et suppression de la session)
const PUBLIC_API = ['/api/login', '/api/_auth/']
const PROTECTED = ['/api/', '/images/']

// Expiration glissante : 7 jours sans visite, prolongée au plus une fois par heure
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000
const REFRESH_EVERY = 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session.user) {
    const age = Date.now() - (session.refreshedAt ?? Date.now())
    if (age > SESSION_TTL) {
      await clearUserSession(event)
      session.user = undefined
    } else if (!session.refreshedAt || age > REFRESH_EVERY) {
      // Réécrit le cookie : son maxAge (nuxt.config) repart de maintenant
      await setUserSession(event, { refreshedAt: Date.now() })
    }
  }

  const { pathname } = getRequestURL(event)
  if (!PROTECTED.some(path => pathname.startsWith(path)) || PUBLIC_API.some(path => pathname.startsWith(path))) return

  if (!session.user) {
    throw createError({ status: 401, statusText: 'Non authentifié' })
  }
})
