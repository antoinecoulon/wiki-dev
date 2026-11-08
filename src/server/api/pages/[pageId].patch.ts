import { eq, inArray, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Section = typeof schema.pages.$inferInsert.section
type Space = typeof schema.pages.$inferInsert.space
type Status = typeof schema.pages.$inferInsert.status

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const { title, content, section, space, parentId, status, favorite, tags, baseUpdatedAt, overwrite } = await readValidatedBody(event, (body) => {
    const { title, content, section, space, parentId, status, favorite, tags, baseUpdatedAt, overwrite } = (body ?? {}) as { title?: unknown, content?: unknown, section?: unknown, space?: unknown, parentId?: unknown, status?: unknown, favorite?: unknown, tags?: unknown, baseUpdatedAt?: unknown, overwrite?: unknown }
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
    if (favorite !== undefined && typeof favorite !== 'boolean') {
      throw createError({ status: 400, statusText: 'Favori invalide' })
    }
    if (baseUpdatedAt !== undefined && typeof baseUpdatedAt !== 'string') {
      throw createError({ status: 400, statusText: 'Version invalide' })
    }
    if (overwrite !== undefined && typeof overwrite !== 'boolean') {
      throw createError({ status: 400, statusText: 'Option overwrite invalide' })
    }
    if (tags !== undefined && (!Array.isArray(tags) || tags.length > 20 || tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.length > 40))) {
      throw createError({ status: 400, statusText: 'Tags invalides' })
    }
    const normalizedTags = tags === undefined ? undefined : normalizeTags(tags as string[])
    return { title: title?.trim(), content, section: section as Section, space: space as Space, parentId, status: status as Status, favorite, tags: normalizedTags, baseUpdatedAt, overwrite }
  })

  const current = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId), columns: { title: true, content: true, space: true, section: true, parentId: true, updatedAt: true } })
  if (!current) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  // Contrôle de version (D-009) : la page a changé depuis que l'éditeur l'a chargée (Claude via MCP, autre appareil)
  const changedElsewhere = !!baseUpdatedAt && baseUpdatedAt !== current.updatedAt
  if (changedElsewhere && !overwrite) {
    throw createError({ status: 409, statusText: 'Page modifiée ailleurs' })
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
    const height = 1 + Math.max(0, ...tree.map(row => row.depth))
    if (await pageLevel(parentId) + height > MAX_PAGE_DEPTH) {
      throw createError({ status: 400, statusText: `Arborescence limitée à ${MAX_PAGE_DEPTH} niveaux` })
    }
  }

  // Écraser après un conflit : la version écrasée (celle de Claude ou d'un autre appareil) reste dans l'historique
  if (changedElsewhere) {
    await saveRevision({ id: pageId, title: current.title, content: current.content })
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
      favorite,
      tags,
      // Mettre en favori n'est pas une modification : la page ne remonte pas dans les récentes
      updatedAt: [title, content, section, space, parentId, status, tags].some(value => value !== undefined) ? new Date().toISOString() : undefined
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
