import type { JSONContent } from '@tiptap/core'
import { sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

type Space = typeof schema.pages.$inferInsert.space

// Niveau d'une page dans l'arborescence (1 = racine), plafonné à MAX_PAGE_DEPTH
export async function pageLevel(pageId: string) {
  const [level] = await db.all<{ depth: number }>(sql`
    WITH RECURSIVE up(id, depth) AS (
      SELECT parent_id, 1 FROM pages WHERE id = ${pageId}
      UNION ALL SELECT pages.parent_id, up.depth + 1 FROM pages JOIN up ON pages.id = up.id WHERE up.depth < ${MAX_PAGE_DEPTH}
    )
    SELECT max(depth) AS depth FROM up`)
  return level!.depth
}

// Nouveau projet (D-007) : page racine de Projets, statut « idée », fiche (modèle par défaut) et pages du noyau en sous-pages
export async function createProject(space: Space, options: { title?: string, fiche?: JSONContent } = {}) {
  const template = projectTemplate(new Date().toISOString().slice(0, 10))
  const [project] = await db.insert(schema.pages)
    .values({ title: options.title, section: 'project', space, status: 'idea', content: JSON.stringify(options.fiche ?? template.fiche) })
    .returning()
  // Dates de création décalées d'1 ms : la sidebar trie par création, les sous-pages gardent l'ordre du modèle
  const createdAt = Date.now()
  await db.insert(schema.pages).values(template.children.map((child, index) => ({
    title: child.title,
    createdAt: new Date(createdAt + index).toISOString(),
    updatedAt: new Date(createdAt + index).toISOString(),
    content: JSON.stringify(child.content),
    section: 'project' as const,
    space,
    parentId: project!.id
  })))
  return project!
}

// « Unity » et « unity » : un seul tag
export function normalizeTags(tags: string[]) {
  return [...new Set(tags.map(tag => tag.trim().toLowerCase()))]
}
