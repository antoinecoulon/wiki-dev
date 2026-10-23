import { desc, getTableColumns } from 'drizzle-orm'
import { db, schema } from 'hub:db'

// Métadonnées seulement : la sidebar, l'accueil et la recherche n'ont pas besoin du contenu (lu par GET /api/pages/:id)
const { content: _content, ...columns } = getTableColumns(schema.pages)

export default defineEventHandler(() => {
  return db.select(columns).from(schema.pages).orderBy(desc(schema.pages.updatedAt))
})
