// /api/_auth/** : endpoints internes de nuxt-auth-utils (lecture et suppression de la session)
const PUBLIC_API = ['/api/login', '/api/_auth/']

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!pathname.startsWith('/api/') || PUBLIC_API.some(path => pathname.startsWith(path))) return

  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ status: 401, statusText: 'Non authentifié' })
  }
})
