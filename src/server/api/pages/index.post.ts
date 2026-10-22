import { eq, sql } from 'drizzle-orm'
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
    const [level] = await db.all<{ depth: number }>(sql`
      WITH RECURSIVE up(id, depth) AS (
        SELECT parent_id, 1 FROM pages WHERE id = ${parentId}
        UNION ALL SELECT pages.parent_id, up.depth + 1 FROM pages JOIN up ON pages.id = up.id WHERE up.depth < ${MAX_PAGE_DEPTH}
      )
      SELECT max(depth) AS depth FROM up`)
    // Niveau du parent : la sous-page serait un niveau en dessous
    if (level!.depth >= MAX_PAGE_DEPTH) {
      throw createError({ status: 400, statusText: `Arborescence limitée à ${MAX_PAGE_DEPTH} niveaux` })
    }
    const [page] = await db.insert(schema.pages).values({ ...parent, parentId }).returning()
    return page
  }

  // Page racine dans Projets = nouveau projet : fiche pré-remplie, statut « idée » et pages du noyau en sous-pages
  if (section === 'project') {
    const template = projectTemplate(new Date().toISOString().slice(0, 10))
    const [project] = await db.insert(schema.pages)
      .values({ section, space, status: 'idea', content: JSON.stringify(template.fiche) })
      .returning()
    await db.insert(schema.pages).values(template.children.map(child => ({
      title: child.title,
      content: JSON.stringify(child.content),
      section,
      space,
      parentId: project!.id
    })))
    return project
  }

  const [page] = await db.insert(schema.pages).values({ section, space }).returning()
  return page
})
