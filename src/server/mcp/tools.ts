import type { JSONContent } from '@tiptap/core'
import { McpServer } from '@modelcontextprotocol/server'
import { and, asc, desc, eq, inArray, like, or } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { z } from 'zod'

// Accès Claude N0 (D-008) : lecture + ajout seul ; ni remplacement de contenu, ni suppression

const space = z.enum(schema.pages.space.enumValues).describe('Espace : « perso » ou « pro »')
const section = z.enum(schema.pages.section.enumValues).describe('Section : « project » (Projets) ou « doc » (Documentation)')
const status = z.enum(['idea', 'active', 'done']).describe('Statut d\'un projet : idea (idée), active (en cours), done (terminé)')
const tags = z.array(z.string().trim().min(1).max(40)).max(20).describe('Tags libres (normalisés en minuscules, sans doublon)')
const pageId = z.string().describe('Identifiant (UUID) de la page')

const json = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] })
const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })

// Métadonnées de toutes les pages (sans contenu) : sert à calculer chemins et sous-pages, volume faible
async function allPages() {
  return db.select({
    id: schema.pages.id,
    title: schema.pages.title,
    parentId: schema.pages.parentId,
    section: schema.pages.section,
    space: schema.pages.space,
    status: schema.pages.status,
    tags: schema.pages.tags,
    createdAt: schema.pages.createdAt,
    updatedAt: schema.pages.updatedAt
  }).from(schema.pages).orderBy(asc(schema.pages.createdAt), asc(schema.pages.title))
}
type PageMeta = Awaited<ReturnType<typeof allPages>>[number]

// Titres des parents, de la racine jusqu'à la page exclue
function pathOf(page: PageMeta, byId: Map<string, PageMeta>) {
  const titles: string[] = []
  for (let parent = page.parentId && byId.get(page.parentId); parent; parent = parent.parentId && byId.get(parent.parentId)) {
    titles.unshift(parent.title)
  }
  return titles.join(' / ')
}

async function findPage(id: string) {
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, id) })
  if (!page) throw new Error(`Page introuvable : ${id}`)
  return { ...page, raw: page.content, content: (page.content ? JSON.parse(page.content) : null) as JSONContent | null }
}

export function buildMcpServer() {
  const server = new McpServer({ name: 'wiki-dev', version: '0.1.0' }, {
    instructions: 'wiki-dev : wiki personnel de dev (perso et pro). Les pages sont rangées par espace (perso / pro) et par section (Projets / Documentation), en arborescence de 5 niveaux max. '
      + 'Un projet est une page racine de la section Projets (sa fiche) avec un statut ; ses sous-pages forment le noyau de la méthode Colonne : Colonne (grille des tranches, états □ prévue · ◧ en cours · ■ faite), DoD, Journal, Décisions, plus des briques facultatives. '
      + 'Le contenu s\'échange en Markdown. On peut lire, créer, ajouter en fin de page et modifier un passage (edit_page) ; chaque modification garde la version précédente (list_revisions, restore_revision). On ne peut pas supprimer de page (à faire dans l\'app).'
  })

  server.registerTool('search_pages', {
    title: 'Chercher des pages',
    description: 'Cherche dans le titre, les tags et le texte des pages. Renvoie les métadonnées (id, titre, chemin des pages parentes, section, espace, statut, tags), 30 résultats max, les plus récents d\'abord. Lire ensuite une page avec get_page.',
    inputSchema: z.object({ query: z.string().min(1).describe('Texte à chercher'), space: space.optional(), section: section.optional() }),
    annotations: { readOnlyHint: true }
  }, async ({ query, space, section }) => {
    const pattern = `%${query}%`
    const matches = await db.select({ id: schema.pages.id }).from(schema.pages)
      .where(and(
        or(like(schema.pages.title, pattern), like(schema.pages.tags, pattern), like(schema.pages.content, pattern)),
        space ? eq(schema.pages.space, space) : undefined,
        section ? eq(schema.pages.section, section) : undefined
      ))
      .orderBy(desc(schema.pages.updatedAt))
      .limit(30)
    const pages = await allPages()
    const byId = new Map(pages.map(page => [page.id, page]))
    return json(matches.map(({ id }) => {
      const page = byId.get(id)!
      return { id, title: page.title, path: pathOf(page, byId), section: page.section, space: page.space, status: page.status, tags: page.tags, updatedAt: page.updatedAt }
    }))
  })

  server.registerTool('list_projects', {
    title: 'Lister les projets',
    description: 'Liste les projets (pages racines de la section Projets) avec leur statut, leurs tags et leurs sous-pages (id et titre).',
    inputSchema: z.object({ space: space.optional(), status: status.optional() }),
    annotations: { readOnlyHint: true }
  }, async ({ space, status }) => {
    const pages = await allPages()
    return json(pages
      .filter(page => page.section === 'project' && !page.parentId && (!space || page.space === space) && (!status || page.status === status))
      .map(project => ({
        id: project.id,
        title: project.title,
        space: project.space,
        status: project.status,
        tags: project.tags,
        updatedAt: project.updatedAt,
        subpages: pages.filter(page => page.parentId === project.id).map(page => ({ id: page.id, title: page.title }))
      })))
  })

  server.registerTool('get_page', {
    title: 'Lire une page',
    description: 'Renvoie une page en Markdown avec ses métadonnées et la liste de ses sous-pages directes. Avec include_subpages, renvoie toute la branche (la page et toutes ses sous-pages, en Markdown) : utile pour charger un projet entier comme contexte. Les images sont des liens relatifs à l\'app (/images/...).',
    inputSchema: z.object({ id: pageId, include_subpages: z.boolean().default(false).describe('Inclure le contenu de toutes les sous-pages') }),
    annotations: { readOnlyHint: true }
  }, async ({ id, include_subpages }) => {
    const page = await findPage(id)
    const pages = await allPages()
    const byId = new Map(pages.map(item => [item.id, item]))
    const meta = (item: PageMeta | typeof page) => [
      `id: ${item.id}`,
      `chemin: ${pathOf(item as PageMeta, byId) || '(racine)'}`,
      `section: ${item.section} · espace: ${item.space}${item.status ? ` · statut: ${item.status}` : ''}`,
      `tags: ${item.tags.join(', ') || '(aucun)'}`,
      `modifiée: ${item.updatedAt}`
    ].join('\n')
    const children = pages.filter(item => item.parentId === id)

    if (!include_subpages) {
      const list = children.map(child => `- ${child.title} (id: ${child.id})`).join('\n') || '(aucune)'
      return text(`# ${page.title}\n\n${meta(page)}\n\n---\n\n${toMarkdown(page.content)}\n\n---\n\nSous-pages :\n${list}`)
    }

    // Branche entière, dans l'ordre de la sidebar (parcours en profondeur)
    const ordered: PageMeta[] = []
    const walk = (parentId: string) => pages.filter(item => item.parentId === parentId).forEach((item) => {
      ordered.push(item)
      walk(item.id)
    })
    walk(id)
    const contents = ordered.length
      ? await db.select({ id: schema.pages.id, content: schema.pages.content }).from(schema.pages)
          .where(inArray(schema.pages.id, ordered.map(item => item.id)))
      : []
    const contentById = new Map(contents.map(item => [item.id, item.content ? JSON.parse(item.content) as JSONContent : null]))
    const sections = [`# ${page.title}\n\n${meta(page)}\n\n---\n\n${toMarkdown(page.content)}`]
    for (const item of ordered) {
      sections.push(`# ${pathOf(item, byId)} / ${item.title}\n\n${meta(item)}\n\n---\n\n${toMarkdown(contentById.get(item.id) ?? null)}`)
    }
    return text(sections.join('\n\n==========\n\n'))
  })

  server.registerTool('create_page', {
    title: 'Créer une page',
    description: 'Crée une page. Avec parentId : sous-page, qui hérite de l\'espace et de la section du parent (5 niveaux max). Sans parentId et section « project » : nouveau projet (statut idée) avec ses sous-pages du noyau (Colonne, DoD, Journal, Décisions) ; le markdown, s\'il est fourni, remplace le modèle de fiche. Sans parentId et section « doc » (défaut) : page de documentation à la racine.',
    inputSchema: z.object({
      title: z.string().trim().min(1).max(200).describe('Titre de la page'),
      markdown: z.string().optional().describe('Contenu en Markdown (titres, listes, checklists - [ ], tableaux, blocs de code avec langage, citations)'),
      parentId: pageId.optional().describe('Page parente (sous-page)'),
      section: section.default('doc'),
      space: space.default('perso'),
      tags: tags.optional()
    })
  }, async ({ title, markdown, parentId, section, space, tags }) => {
    const content = markdown ? fromMarkdown(markdown) : undefined
    const normalizedTags = tags ? normalizeTags(tags) : undefined
    let created: { id: string }

    if (parentId) {
      const parent = await db.query.pages.findFirst({ where: eq(schema.pages.id, parentId), columns: { space: true, section: true } })
      if (!parent) throw new Error(`Page parente introuvable : ${parentId}`)
      if (await pageLevel(parentId) >= MAX_PAGE_DEPTH) throw new Error(`Arborescence limitée à ${MAX_PAGE_DEPTH} niveaux`)
      ;[created] = await db.insert(schema.pages)
        .values({ title, content: content && JSON.stringify(content), space: parent.space, section: parent.section, parentId, tags: normalizedTags })
        .returning({ id: schema.pages.id }) as [{ id: string }]
    } else if (section === 'project') {
      created = await createProject(space, { title, fiche: content })
      if (normalizedTags) await db.update(schema.pages).set({ tags: normalizedTags }).where(eq(schema.pages.id, created.id))
    } else {
      ;[created] = await db.insert(schema.pages)
        .values({ title, content: content && JSON.stringify(content), space, section, tags: normalizedTags })
        .returning({ id: schema.pages.id }) as [{ id: string }]
    }
    return json({ id: created.id, title })
  })

  server.registerTool('append_to_page', {
    title: 'Ajouter à la fin d\'une page',
    description: 'Ajoute du contenu Markdown à la fin d\'une page existante, sans toucher au contenu déjà présent. Pour un journal ou des décisions où « les plus récentes sont en haut », signaler à l\'utilisateur que l\'ajout se fait en bas.',
    inputSchema: z.object({ id: pageId, markdown: z.string().min(1).describe('Contenu à ajouter, en Markdown') })
  }, async ({ id, markdown }) => {
    const page = await findPage(id)
    await saveRevision({ id, title: page.title, content: page.raw })
    const added = fromMarkdown(markdown).content ?? []
    const content: JSONContent = { type: 'doc', content: [...(page.content?.content ?? []), ...added] }
    await db.update(schema.pages)
      .set({ content: JSON.stringify(content), updatedAt: new Date().toISOString() })
      .where(eq(schema.pages.id, id))
    return json({ id, title: page.title, addedBlocks: added.length })
  })

  server.registerTool('edit_page', {
    title: 'Modifier un passage d\'une page',
    description: 'Remplace un passage du Markdown d\'une page (tel que renvoyé par get_page, recopié à l\'identique, assez long pour être unique) par un nouveau texte Markdown ; new_text vide pour supprimer le passage. Seuls les blocs touchés sont reconvertis, le reste de la page ne bouge pas. La version précédente est gardée (restore_revision). Relire la page avec get_page juste avant : elle a pu changer dans l\'app.',
    inputSchema: z.object({
      id: pageId,
      old_text: z.string().min(1).describe('Passage exact à remplacer'),
      new_text: z.string().describe('Nouveau texte (Markdown), vide pour supprimer')
    })
  }, async ({ id, old_text, new_text }) => {
    const page = await findPage(id)
    const content = editMarkdown(page.content, old_text, new_text)
    await saveRevision({ id, title: page.title, content: page.raw })
    await db.update(schema.pages)
      .set({ content: JSON.stringify(content), updatedAt: new Date().toISOString() })
      .where(eq(schema.pages.id, id))
    return json({ id, title: page.title, edited: true })
  })

  server.registerTool('list_revisions', {
    title: 'Versions précédentes d\'une page',
    description: 'Liste les versions précédentes d\'une page (enregistrées avant chaque modification via MCP, 10 dernières), de la plus récente à la plus ancienne.',
    inputSchema: z.object({ id: pageId }),
    annotations: { readOnlyHint: true }
  }, async ({ id }) => {
    const revisions = await db.select().from(schema.pageRevisions)
      .where(eq(schema.pageRevisions.pageId, id))
      .orderBy(desc(schema.pageRevisions.createdAt))
    return json(revisions.map(revision => ({
      revisionId: revision.id,
      savedAt: revision.createdAt,
      title: revision.title,
      length: toMarkdown(revision.content ? JSON.parse(revision.content) : null).length
    })))
  })

  server.registerTool('restore_revision', {
    title: 'Restaurer une version précédente',
    description: 'Remet le contenu d\'une page à une version précédente (revisionId de list_revisions ; sans revisionId, la plus récente, c\'est-à-dire l\'état avant la dernière modification via MCP). Le contenu actuel est lui-même gardé comme version, la restauration peut donc s\'annuler.',
    inputSchema: z.object({ id: pageId, revisionId: z.string().optional().describe('Version à restaurer (défaut : la plus récente)') })
  }, async ({ id, revisionId }) => {
    const page = await findPage(id)
    const [revision] = await db.select().from(schema.pageRevisions)
      .where(and(eq(schema.pageRevisions.pageId, id), revisionId ? eq(schema.pageRevisions.id, revisionId) : undefined))
      .orderBy(desc(schema.pageRevisions.createdAt))
      .limit(1)
    if (!revision) throw new Error('Aucune version précédente pour cette page')
    await saveRevision({ id, title: page.title, content: page.raw })
    await db.update(schema.pages)
      .set({ content: revision.content, updatedAt: new Date().toISOString() })
      .where(eq(schema.pages.id, id))
    return json({ id, title: page.title, restoredFrom: revision.createdAt })
  })

  server.registerTool('set_page_meta', {
    title: 'Changer le statut ou les tags',
    description: 'Change le statut d\'un projet (page racine de Projets uniquement) et/ou remplace les tags d\'une page.',
    inputSchema: z.object({ id: pageId, status: status.optional(), tags: tags.optional() })
  }, async ({ id, status, tags }) => {
    if (status === undefined && tags === undefined) throw new Error('Rien à modifier : status ou tags attendu')
    const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, id), columns: { section: true, parentId: true } })
    if (!page) throw new Error(`Page introuvable : ${id}`)
    if (status && (page.section !== 'project' || page.parentId)) throw new Error('Le statut ne s\'applique qu\'à un projet (page racine de Projets)')
    const [updated] = await db.update(schema.pages)
      .set({ status, tags: tags && normalizeTags(tags), updatedAt: new Date().toISOString() })
      .where(eq(schema.pages.id, id))
      .returning({ id: schema.pages.id, status: schema.pages.status, tags: schema.pages.tags })
    return json(updated)
  })

  return server
}
