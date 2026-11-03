import type { JSONContent } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { MarkdownManager } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'

// Mêmes nœuds que l'éditeur (app/pages/pages/[pageId].vue) ; le codeBlock de StarterKit a le même nom et
// l'attribut language que notre CodeBlock lowlight, dont la NodeView Vue ne peut pas tourner côté serveur
const manager = new MarkdownManager({
  extensions: [StarterKit, Image, TaskList, TaskItem.configure({ nested: true }), TableKit]
})

export function toMarkdown(content: JSONContent | null) {
  return content ? manager.serialize(content) : ''
}

export function fromMarkdown(markdown: string): JSONContent {
  return manager.parse(markdown)
}
