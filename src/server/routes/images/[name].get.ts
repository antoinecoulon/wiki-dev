import { get } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')!
  const result = await get(`images/${name}`, { access: 'private' }).catch(() => null)
  if (result?.statusCode !== 200) {
    throw createError({ status: 404, statusText: 'Image introuvable' })
  }

  setResponseHeaders(event, {
    'Content-Type': result.blob.contentType,
    // Nom unique (UUID) jamais réécrit : cache navigateur illimité, jamais partagé
    'Cache-Control': 'private, max-age=31536000, immutable'
  })
  return result.stream
})
