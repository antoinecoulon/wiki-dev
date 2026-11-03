import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull().default('Sans titre'),
  // JSON TipTap (D-003)
  content: text('content'),
  // D-004
  space: text('space', { enum: ['perso', 'pro'] }).notNull().default('perso'),
  section: text('section', { enum: ['project', 'doc'] }).notNull().default('doc'),
  // Page parente (arborescence) ; null = à la racine de la section. Pas de clé étrangère : la suppression fait remonter les sous-pages (API)
  parentId: text('parent_id'),
  // Statut d'un projet (page racine de la section Projets) ; null pour les autres pages
  status: text('status', { enum: ['idea', 'active', 'done'] }),
  // Favori : affiché en haut de la sidebar
  favorite: integer('favorite', { mode: 'boolean' }).notNull().default(false),
  // Tags libres (minuscules, sans doublon), tableau JSON
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
})

// Versions précédentes d'une page, enregistrées avant chaque modification par Claude via MCP (D-009) ; 10 dernières par page
export const pageRevisions = sqliteTable('page_revisions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageId: text('page_id').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
}, table => [index('page_revisions_page_id_idx').on(table.pageId)])
