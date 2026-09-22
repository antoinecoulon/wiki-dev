interface TipTapNode {
  type: string
  text?: string
  content?: TipTapNode[]
}

export function extractText(doc: TipTapNode): string {
  if (doc.text) return doc.text
  if (!doc.content) return ''
  return doc.content.map(extractText).join(' ').replace(/\s+/g, ' ').trim()
}