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

// @tiptap/markdown encode & < > en entités dans tout le texte (hors code) : Markdown illisible (`List&lt;int&gt;`)
// et passages introuvables par edit_page. Sans extension HTML, < et > restent du texte à la relecture ; on n'encode
// donc que ce qui changerait de sens : & devant une entité décodée au parsing, > en début de texte (citation)
const ENTITY_AHEAD = /&(?=#\d{1,7};|#[xX][0-9a-fA-F]{1,6};|(?:lt|gt|quot|amp);)/g
type TextEncoder = { escapeMarkdownSyntax: (text: string) => string, codeTypes: Set<string> }
type Node = { marks?: (string | { type: string })[] }
Object.assign(manager, {
  encodeTextForMarkdown(this: TextEncoder, text: string, node: Node, parentNode?: { type?: string }) {
    const inCode = (parentNode?.type != null && this.codeTypes.has(parentNode.type))
      || (node.marks ?? []).some(mark => this.codeTypes.has(typeof mark === 'string' ? mark : mark.type))
    if (inCode) return text
    return this.escapeMarkdownSyntax(text.replace(ENTITY_AHEAD, '&amp;').replace(/^>|(?<=\n)>/g, '&gt;'))
  }
})

const SEPARATOR = '\n\n'

// Markdown de chaque bloc racine, séparément : une modification ne reconvertit que les blocs qu'elle touche
// (l'aller-retour Markdown n'est pas tout à fait neutre : espaces en fin de cellule, puces vides, liens automatiques)
function blocksOf(content: JSONContent | null) {
  return (content?.content ?? []).map(block => manager.serialize({ type: 'doc', content: [block] }).trim())
}

export function toMarkdown(content: JSONContent | null) {
  return blocksOf(content).join(SEPARATOR)
}

export function fromMarkdown(markdown: string): JSONContent {
  return manager.parse(markdown)
}

// Remplace un passage unique du Markdown de la page ; seuls les blocs qu'il recouvre sont reconvertis
export function editMarkdown(content: JSONContent | null, oldText: string, newText: string): JSONContent {
  const blocks = blocksOf(content)
  const markdown = blocks.join(SEPARATOR)
  const start = markdown.indexOf(oldText)
  if (start === -1) {
    throw new Error('Passage introuvable : relire la page avec get_page et recopier le passage à l\'identique')
  }
  if (markdown.indexOf(oldText, start + 1) !== -1) {
    throw new Error('Passage présent plusieurs fois : l\'allonger pour qu\'il soit unique')
  }
  const end = start + oldText.length

  // Blocs touchés par le passage [start, end[ ; le séparateur qui suit un bloc compte pour ce bloc
  const spans = blocks.map((block, index) => {
    const from = blocks.slice(0, index).reduce((sum, previous) => sum + previous.length + SEPARATOR.length, 0)
    return { from, to: from + block.length }
  })
  const touched = spans.flatMap(({ from, to }, index) => start < to + SEPARATOR.length && end > from ? [index] : [])
  const first = touched[0]!
  const last = touched.at(-1)!

  const segment = markdown.slice(spans[first]!.from, start) + newText + markdown.slice(end, spans[last]!.to)
  const replaced = segment.trim() ? (fromMarkdown(segment).content ?? []) : []

  const nodes = content?.content ?? []
  return { type: 'doc', content: [...nodes.slice(0, first), ...replaced, ...nodes.slice(last + 1)] }
}
