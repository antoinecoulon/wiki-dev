import { desc } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(() => {
  return db.select().from(schema.pages).orderBy(desc(schema.pages.updatedAt))
})
