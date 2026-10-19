import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section

export default defineEventHandler(async (event) => {
  const { section } = await readValidatedBody(event, (body) => {
    const { section } = (body ?? {}) as { section?: unknown }
    if (section !== undefined && !schema.pages.section.enumValues.includes(section as never)) {
      throw createError({ status: 400, statusText: 'Section invalide' })
    }
    return { section: section as Section }
  })

  const [page] = await db.insert(schema.pages).values({ section }).returning()
  return page
})
