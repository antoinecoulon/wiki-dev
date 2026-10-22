import { eq, inArray, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space
type Status = typeof schema.pages.$inferInsert.status

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const { title, content, section, space, parentId, status } = await readValidatedBody(event, (body) => {
    const { title, content, section, space, parentId, status } = (body ?? {}) as { title?: unknown, content?: unknown, section?: unknown, space?: unknown, parentId?: unknown, status?: unknown }
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
    if (status !== undefined && status !== null && !schema.pages.status.enumValues.includes(status as never)) {
      throw createError({ status: 400, statusText: 'Statut invalide' })
    }
    return { title: title?.trim(), content, section: section as Section, space: space as Space, parentId, status: status as Status }
  })

  const current = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId), columns: { space: true, section: true, parentId: true } })
  if (!current) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  const nextSpace = space ?? current.space
  const nextSection = section ?? current.section
  // depth : 1 pour une sous-page directe
  const tree = await db.all<{ id: string, depth: number }>(sql`
    WITH RECURSIVE tree(id, depth) AS (
      SELECT id, 1 FROM pages WHERE parent_id = ${pageId}
      UNION SELECT pages.id, tree.depth + 1 FROM pages JOIN tree ON pages.parent_id = tree.id
    )
    SELECT id, depth FROM tree`)
  const descendants = tree.map(row => row.id)

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
  // Niveau du parent + hauteur de la branche déplacée (la page et ses sous-pages) ; vérifié seulement si le parent change,
  // pour que l'autosave d'une page déjà trop profonde (créée avant la limite) reste possible
  if (parentId && parentId !== current.parentId) {
    const [level] = await db.all<{ depth: number }>(sql`
      WITH RECURSIVE up(id, depth) AS (
        SELECT parent_id, 1 FROM pages WHERE id = ${parentId}
        UNION ALL SELECT pages.parent_id, up.depth + 1 FROM pages JOIN up ON pages.id = up.id WHERE up.depth < ${MAX_PAGE_DEPTH}
      )
      SELECT max(depth) AS depth FROM up`)
    const height = 1 + Math.max(0, ...tree.map(row => row.depth))
    if (level!.depth + height > MAX_PAGE_DEPTH) {
      throw createError({ status: 400, statusText: `Arborescence limitée à ${MAX_PAGE_DEPTH} niveaux` })
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
      status,
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
