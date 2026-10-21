import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Plugin, TextSelection } from '@tiptap/pm/state'
import type { EditorState } from '@tiptap/pm/state'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { createLowlight } from 'lowlight'
import bash from 'highlight.js/lib/languages/bash'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import CodeBlockView from '~/components/CodeBlockView.vue'

const INDENT = '    '
const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', '\'': '\'', '`': '`' }
const CLOSING = new Set(Object.values(PAIRS))
// Fermeture des balises seulement en HTML / XML : en C# ou TS, List<int> donnerait </int>
const TAG_LANGUAGES = new Set(['xml'])
const OPEN_TAG = /<([a-zA-Z][\w:.-]*)(?:\s[^<>]*)?$/
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

// Curseur dans un bloc de code : ligne avant le curseur, caractères autour, langage
function codeContext(state: EditorState) {
  const { $from, empty } = state.selection
  if ($from.parent.type.name !== 'codeBlock') return null
  const text = $from.parent.textContent
  const offset = $from.parentOffset
  return {
    empty,
    before: text[offset - 1] ?? '',
    after: text[offset] ?? '',
    line: text.slice(0, offset).split('\n').pop()!,
    language: $from.parent.attrs.language as string | null
  }
}

// Comportements d'IDE : paires auto-fermantes, saut du caractère fermant, balises HTML
const codePairs = new Plugin({
  props: {
    handleTextInput(view, from, to, text) {
      const ctx = codeContext(view.state)
      if (!ctx) return false
      const { state } = view

      // Caractère fermant déjà présent : on passe par-dessus
      if (ctx.empty && CLOSING.has(text) && ctx.after === text) {
        view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, from + 1)))
        return true
      }

      const close = PAIRS[text]
      if (close) {
        // Sélection : on l'entoure
        if (!ctx.empty) {
          const tr = state.tr.insertText(close, to).insertText(text, from)
          view.dispatch(tr.setSelection(TextSelection.create(tr.doc, from + 1, to + 1)))
          return true
        }
        // Pas de paire devant un mot, ni d'apostrophe dans un mot (don't)
        const isQuote = text === close
        if (/\w/.test(ctx.after) || (isQuote && /\w/.test(ctx.before))) return false
        const tr = state.tr.insertText(text + close, from, to)
        view.dispatch(tr.setSelection(TextSelection.create(tr.doc, from + 1)))
        return true
      }

      // <div + > : ajoute </div>
      if (text === '>' && ctx.empty && TAG_LANGUAGES.has(ctx.language ?? '')) {
        const tag = OPEN_TAG.exec(ctx.line)?.[1]
        if (!tag || ctx.line.endsWith('/') || VOID_TAGS.has(tag.toLowerCase())) return false
        const tr = state.tr.insertText(`></${tag}>`, from, to)
        view.dispatch(tr.setSelection(TextSelection.create(tr.doc, from + 1)))
        return true
      }

      return false
    }
  }
})

// Sans langage choisi (« Auto »), lowlight détecte parmi ces langages
const lowlight = createLowlight({ bash, csharp, css, javascript, json, typescript, xml })

export const CodeBlock = CodeBlockLowlight.extend({
  addNodeView: () => VueNodeViewRenderer(CodeBlockView),
  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), codePairs]
  },
  addKeyboardShortcuts() {
    // Mêmes touches que le bloc d'origine : sans relais, on perdrait ses comportements
    // (sortie après 3 Entrée, Backspace dans un bloc vide)
    const parent = this.parent?.() ?? {}
    return {
      ...parent,
      // Paire vide : Backspace supprime les deux caractères
      Backspace: (props) => {
        const { editor } = props
        const ctx = codeContext(editor.state)
        if (!ctx?.empty || !ctx.before || PAIRS[ctx.before] !== ctx.after) return parent.Backspace?.(props) ?? false
        const { from } = editor.state.selection
        return editor.commands.deleteRange({ from: from - 1, to: from + 1 })
      },
      // Entrée : garde l'indentation de la ligne ; entre { } ouvre un bloc indenté
      Enter: (props) => {
        const { editor } = props
        const ctx = codeContext(editor.state)
        const indent = ctx?.empty ? /^[ \t]*/.exec(ctx.line)![0] : ''
        const inBraces = ctx?.before === '{' && ctx.after === '}'
        // Ligne non indentée : comportement du bloc d'origine
        if (!ctx?.empty || (!indent && !inBraces)) return parent.Enter?.(props) ?? false
        // insertText : insertContent analyserait la chaîne comme du HTML
        return editor.commands.command(({ tr }) => {
          const { from } = tr.selection
          const inner = `\n${indent}${inBraces ? INDENT : ''}`
          tr.insertText(inBraces ? `${inner}\n${indent}` : inner, from)
          tr.setSelection(TextSelection.create(tr.doc, from + inner.length))
          return true
        })
      }
    }
  }
}).configure({ lowlight, enableTabIndentation: true, tabSize: INDENT.length })
