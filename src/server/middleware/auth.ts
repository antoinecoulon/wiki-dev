export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/') || url.pathname.startsWith('/api/auth')) return
  const session = await getUserSession(event)
  if (!session.user) throw createError({ status: 401, statusText: 'Non authentifié' })
})