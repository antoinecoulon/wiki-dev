import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space

export default defineEventHandler(async (event) => {
  const { section, space, parentId, brick } = await readValidatedBody(event, (body) => {
    const { section, space, parentId, brick } = (body ?? {}) as { section?: unknown, space?: unknown, parentId?: unknown, brick?: unknown }
    if (section !== undefined && !schema.pages.section.enumValues.includes(section as never)) {
      throw createError({ status: 400, statusText: 'Section invalide' })
    }
    if (space !== undefined && !schema.pages.space.enumValues.includes(space as never)) {
      throw createError({ status: 400, statusText: 'Espace invalide' })
    }
    if (parentId !== undefined && typeof parentId !== 'string') {
      throw createError({ status: 400, statusText: 'Page parente invalide' })
    }
    if (brick !== undefined && (typeof brick !== 'string' || !Object.hasOwn(BRICKS, brick) || !parentId)) {
      throw createError({ status: 400, statusText: 'Brique invalide' })
    }
    return { section: section as Section, space: space as Space, parentId, brick: brick as Brick | undefined }
  })

  // Brique : sous-page pré-remplie d'un projet (page racine de Projets), une seule par titre
  if (brick) {
    const project = await db.query.pages.findFirst({ where: eq(schema.pages.id, parentId!), columns: { title: true, space: true, section: true, parentId: true } })
    if (!project || project.section !== 'project' || project.parentId) {
      throw createError({ status: 400, statusText: 'Une brique s\'ajoute à un projet' })
    }
    const template = BRICKS[brick](project.title)
    const existing = await db.query.pages.findFirst({ where: and(eq(schema.pages.parentId, parentId!), eq(schema.pages.title, template.title)), columns: { id: true } })
    if (existing) {
      throw createError({ status: 409, statusText: `Le projet a déjà une page ${template.title}` })
    }
    const [page] = await db.insert(schema.pages)
      .values({ title: template.title, content: JSON.stringify(template.content), space: project.space, section: project.section, parentId })
      .returning()
    return page
  }

  // Sous-page : même espace et même section que son parent
  if (parentId) {
    const parent = await db.query.pages.findFirst({ where: eq(schema.pages.id, parentId), columns: { space: true, section: true } })
    if (!parent) {
      throw createError({ status: 400, statusText: 'Page parente introuvable' })
    }
    // Niveau du parent : la sous-page serait un niveau en dessous
    if (await pageLevel(parentId) >= MAX_PAGE_DEPTH) {
      throw createError({ status: 400, statusText: `Arborescence limitée à ${MAX_PAGE_DEPTH} niveaux` })
    }
    const [page] = await db.insert(schema.pages).values({ ...parent, parentId }).returning()
    return page
  }

  // Page racine dans Projets = nouveau projet : fiche pré-remplie, statut « idée » et pages du noyau en sous-pages
  if (section === 'project') {
    return createProject(space)
  }

  const [page] = await db.insert(schema.pages).values({ section, space }).returning()
  return page
})
