import { eq, inArray, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const { title, content, section, space, parentId } = await readValidatedBody(event, (body) => {
    const { title, content, section, space, parentId } = (body ?? {}) as { title?: unknown, content?: unknown, section?: unknown, space?: unknown, parentId?: unknown }
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
    if (parentId !== undefined && parentId !== null && typeof parentId !== 'string') {
      throw createError({ status: 400, statusText: 'Page parente invalide' })
    }
    return { title: title?.trim(), content, section: section as Section, space: space as Space, parentId }
  })

  const current = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId), columns: { space: true, section: true } })
  if (!current) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  const nextSpace = space ?? current.space
  const nextSection = section ?? current.section
  const descendants = (await db.all<{ id: string }>(sql`
    WITH RECURSIVE tree(id) AS (
      SELECT id FROM pages WHERE parent_id = ${pageId}
      UNION SELECT pages.id FROM pages JOIN tree ON pages.parent_id = tree.id
    )
    SELECT id FROM tree`)).map(row => row.id)

  // Parent : ni la page elle-même ni une de ses sous-pages (boucle), et dans le même espace et la même section
  if (parentId) {
    const parent = await db.query.pages.findFirst({ where: eq(schema.pages.id, parentId), columns: { space: true, section: true } })
    if (!parent || parentId === pageId || descendants.includes(parentId)) {
      throw createError({ status: 400, statusText: 'Page parente invalide' })
    }
    if (parent.space !== nextSpace || parent.section !== nextSection) {
      throw createError({ status: 400, statusText: 'Page parente hors espace ou section' })
    }
  }

  const [page] = await db.update(schema.pages)
    .set({
      title,
      // JSON TipTap stocké en texte (D-003)
      content: content === undefined ? undefined : JSON.stringify(content),
      section,
      space,
      parentId,
      updatedAt: new Date().toISOString()
    })
    .where(eq(schema.pages.id, pageId))
    .returning({ id: schema.pages.id, updatedAt: schema.pages.updatedAt })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  // Les sous-pages suivent leur parent dans son nouvel espace ou sa nouvelle section
  if (descendants.length && (nextSpace !== current.space || nextSection !== current.section)) {
    await db.update(schema.pages)
      .set({ space: nextSpace, section: nextSection })
      .where(inArray(schema.pages.id, descendants))
  }
  return page
})
