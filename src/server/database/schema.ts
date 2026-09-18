import type { AnySQLiteColumn} from "drizzle-orm/sqlite-core";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references((): AnySQLiteColumn => pages.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Sans titre'),
  content: text('content'),
  contentText: text('content_text'),
  position: integer('position').notNull().default(8),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
})