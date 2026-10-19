import type { JSONContent } from '@tiptap/core'
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId) })
  if (!page) {
    throw createError({ status: 404, statusText: 'Page introuvable' })
  }
  return { ...page, content: (page.content ? JSON.parse(page.content) : null) as JSONContent | null }
})
