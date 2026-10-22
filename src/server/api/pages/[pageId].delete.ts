import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId), columns: { parentId: true } })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  // Les sous-pages remontent d'un niveau, sous le parent de la page supprimée
  await db.update(schema.pages)
    .set({ parentId: page.parentId })
    .where(eq(schema.pages.parentId, pageId))
  await db.delete(schema.pages).where(eq(schema.pages.id, pageId))
  setResponseStatus(event, 204)
})
