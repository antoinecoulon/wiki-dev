import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Node } from '@tiptap/pm/model'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// États de la méthode Colonne : un clic fait passer □ → ◧ → ■ → □ (hors blocs de code)
const NEXT: Record<string, string> = { '□': '◧', '◧': '■', '■': '□' }
const STATES = /[□◧■]/g
const CLASS = 'colonne-state'

// Chaque symbole est enveloppé d'une classe : curseur « main » et cible du clic
function decorate(doc: Node) {
  const decorations: Decoration[] = []
  doc.descendants((node, pos) => {
    if (node.type.name === 'codeBlock') return false
    if (!node.isText) return
    for (const match of node.text!.matchAll(STATES)) {
      const from = pos + match.index
      decorations.push(Decoration.inline(from, from + 1, { class: CLASS }))
    }
  })
  return DecorationSet.create(doc, decorations)
}

const key = new PluginKey<DecorationSet>('colonneState')

export const ColonneState = Extension.create({
  name: 'colonneState',

  addProseMirrorPlugins() {
    return [new Plugin({
      key,
      state: {
        init: (_, state) => decorate(state.doc),
        apply: (tr, set) => tr.docChanged ? decorate(tr.doc) : set
      },
      props: {
        decorations: state => key.getState(state),
        handleClick: (view, pos, event) => {
          if (!view.editable || !(event.target as HTMLElement).classList.contains(CLASS)) return false
          // La position cliquée tombe avant ou après le symbole selon le côté du clic
          const { doc } = view.state
          const from = [pos, pos - 1].find(at => at >= 0 && NEXT[doc.textBetween(at, Math.min(at + 1, doc.content.size))])
          if (from === undefined) return false
          view.dispatch(view.state.tr.insertText(NEXT[doc.textBetween(from, from + 1)]!, from, from + 1))
          return true
        }
      }
    })]
  }
})
