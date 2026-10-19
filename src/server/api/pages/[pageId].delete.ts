import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const [page] = await db.delete(schema.pages)
    .where(eq(schema.pages.id, pageId))
    .returning({ id: schema.pages.id })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  setResponseStatus(event, 204)
})
