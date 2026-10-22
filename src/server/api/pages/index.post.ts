import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space

export default defineEventHandler(async (event) => {
  const { section, space, parentId } = await readValidatedBody(event, (body) => {
    const { section, space, parentId } = (body ?? {}) as { section?: unknown, space?: unknown, parentId?: unknown }
    if (section !== undefined && !schema.pages.section.enumValues.includes(section as never)) {
      throw createError({ status: 400, statusText: 'Section invalide' })
    }
    if (space !== undefined && !schema.pages.space.enumValues.includes(space as never)) {
      throw createError({ status: 400, statusText: 'Espace invalide' })
    }
    if (parentId !== undefined && typeof parentId !== 'string') {
      throw createError({ status: 400, statusText: 'Page parente invalide' })
    }
    return { section: section as Section, space: space as Space, parentId }
  })

  // Sous-page : même espace et même section que son parent
  if (parentId) {
    const parent = await db.query.pages.findFirst({ where: eq(schema.pages.id, parentId), columns: { space: true, section: true } })
    if (!parent) {
      throw createError({ status: 400, statusText: 'Page parente introuvable' })
    }
    const [page] = await db.insert(schema.pages).values({ ...parent, parentId }).returning()
    return page
  }

  const [page] = await db.insert(schema.pages).values({ section, space }).returning()
  return page
})
