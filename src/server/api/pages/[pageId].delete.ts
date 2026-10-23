import { eq, inArray, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId), columns: { parentId: true, section: true } })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  // Projet (racine de Projets) : toute la branche part avec lui, des pages du noyau orphelines n'ont pas de sens
  if (page.section === 'project' && !page.parentId) {
    const descendants = (await db.all<{ id: string }>(sql`
      WITH RECURSIVE tree(id) AS (
        SELECT id FROM pages WHERE parent_id = ${pageId}
        UNION SELECT pages.id FROM pages JOIN tree ON pages.parent_id = tree.id
      )
      SELECT id FROM tree`)).map(row => row.id)
    await db.delete(schema.pages).where(inArray(schema.pages.id, [pageId, ...descendants]))
    setResponseStatus(event, 204)
    return
  }
  // Autres pages : les sous-pages remontent d'un niveau, sous le parent de la page supprimée
  await db.update(schema.pages)
    .set({ parentId: page.parentId })
    .where(eq(schema.pages.parentId, pageId))
  await db.delete(schema.pages).where(eq(schema.pages.id, pageId))
  setResponseStatus(event, 204)
})
