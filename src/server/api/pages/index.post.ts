import { db, schema } from 'hub:db'

export default defineEventHandler(async () => {
  const [page] = await db.insert(schema.pages).values({}).returning()
  return page
})
