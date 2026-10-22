import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space

export default defineEventHandler(async (event) => {
  const { section, space } = await readValidatedBody(event, (body) => {
    const { section, space } = (body ?? {}) as { section?: unknown, space?: unknown }
    if (section !== undefined && !schema.pages.section.enumValues.includes(section as never)) {
      throw createError({ status: 400, statusText: 'Section invalide' })
    }
    if (space !== undefined && !schema.pages.space.enumValues.includes(space as never)) {
      throw createError({ status: 400, statusText: 'Espace invalide' })
    }
    return { section: section as Section, space: space as Space }
  })

  const [page] = await db.insert(schema.pages).values({ section, space }).returning()
  return page
})
