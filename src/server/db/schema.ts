import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull().default('Sans titre'),
  // JSON TipTap (D-003)
  content: text('content'),
  // D-004
  space: text('space', { enum: ['perso', 'pro'] }).notNull().default('perso'),
  section: text('section', { enum: ['project', 'doc'] }).notNull().default('doc'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
})
