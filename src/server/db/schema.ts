import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
})
