import { put } from '@vercel/blob'

// Une requête vers une fonction Vercel est limitée à 4,5 Mo
const MAX_SIZE = 4 * 1024 * 1024
// Pas de SVG : il peut contenir du script
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp'
}

export default defineEventHandler(async (event) => {
  const form = await readFormData(event)
  const file = form.get('file')
  if (!(file instanceof File)) {
    throw createError({ status: 400, statusText: 'Fichier manquant' })
  }
  const extension = EXTENSIONS[file.type]
  if (!extension) {
    throw createError({ status: 415, statusText: 'Format non pris en charge (PNG, JPEG, GIF, WebP)' })
  }
  if (file.size > MAX_SIZE) {
    throw createError({ status: 413, statusText: 'Image trop lourde (4 Mo max)' })
  }

  // Store privé : lisible seulement via /images/… (route protégée par le login)
  const pathname = `images/${crypto.randomUUID()}.${extension}`
  await put(pathname, file, { access: 'private', contentType: file.type })
  return { src: `/${pathname}` }
})
