import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const { title, content } = await readValidatedBody(event, (body) => {
    const { title, content } = (body ?? {}) as { title?: unknown, content?: unknown }
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      throw createError({ status: 400, statusText: 'Titre invalide' })
    }
    if (content !== undefined && (typeof content !== 'object' || content === null)) {
      throw createError({ status: 400, statusText: 'Contenu invalide' })
    }
    return { title: title?.trim(), content }
  })

  const [page] = await db.update(schema.pages)
    .set({
      title,
      // JSON TipTap stocké en texte (D-003)
      content: content === undefined ? undefined : JSON.stringify(content),
      updatedAt: new Date().toISOString()
    })
    .where(eq(schema.pages.id, pageId))
    .returning({ id: schema.pages.id, updatedAt: schema.pages.updatedAt })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  return page
})
