// /api/_auth/** : endpoints internes de nuxt-auth-utils (lecture et suppression de la session)
const PUBLIC_API = ['/api/login', '/api/_auth/']
const PROTECTED = ['/api/', '/images/']

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!PROTECTED.some(path => pathname.startsWith(path)) || PUBLIC_API.some(path => pathname.startsWith(path))) return

  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ status: 401, statusText: 'Non authentifié' })
  }
})
