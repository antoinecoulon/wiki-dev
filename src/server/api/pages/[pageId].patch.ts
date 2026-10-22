import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const { title, content, section, space } = await readValidatedBody(event, (body) => {
    const { title, content, section, space } = (body ?? {}) as { title?: unknown, content?: unknown, section?: unknown, space?: unknown }
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      throw createError({ status: 400, statusText: 'Titre invalide' })
    }
    if (content !== undefined && (typeof content !== 'object' || content === null)) {
      throw createError({ status: 400, statusText: 'Contenu invalide' })
    }
    if (section !== undefined && !schema.pages.section.enumValues.includes(section as never)) {
      throw createError({ status: 400, statusText: 'Section invalide' })
    }
    if (space !== undefined && !schema.pages.space.enumValues.includes(space as never)) {
      throw createError({ status: 400, statusText: 'Espace invalide' })
    }
    return { title: title?.trim(), content, section: section as Section, space: space as Space }
  })

  const [page] = await db.update(schema.pages)
    .set({
      title,
      // JSON TipTap stocké en texte (D-003)
      content: content === undefined ? undefined : JSON.stringify(content),
      section,
      space,
      updatedAt: new Date().toISOString()
    })
    .where(eq(schema.pages.id, pageId))
    .returning({ id: schema.pages.id, updatedAt: schema.pages.updatedAt })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  return page
})
