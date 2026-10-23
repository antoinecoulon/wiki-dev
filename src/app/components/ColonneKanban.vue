<script setup lang="ts">
import type { JSONContent } from '@tiptap/core'
import type { DropdownMenuItem } from '@nuxt/ui'

// Kanban des tranches, lu dans la grille de la Colonne (premier tableau de la page) : chaque case qui commence
// par □ ◧ ■ et porte un texte est une carte ; changer son état réécrit le symbole dans le contenu de la page
const content = defineModel<JSONContent | null>({ required: true })

const states = [
  { symbol: '□', label: 'Prévue', icon: 'i-lucide-circle-dashed' },
  { symbol: '◧', label: 'En cours', icon: 'i-lucide-loader' },
  { symbol: '■', label: 'Faite', icon: 'i-lucide-circle-check' }
]
const SYMBOL = /^(\s*)[□◧■]/

type Card = { row: number, col: number, symbol: string, vertebra: string, level: string, label: string }

const cellText = (node: JSONContent): string => node.text ?? (node.content ?? []).map(cellText).join('')
function firstText(node: JSONContent): JSONContent | undefined {
  if (node.type === 'text') return node
  for (const child of node.content ?? []) {
    const found = firstText(child)
    if (found) return found
  }
}

const grid = computed(() => content.value?.content?.find(node => node.type === 'table'))

// Ligne d'en-tête ignorée ; 1re colonne = vertèbre, colonne n = niveau N(n-1). Case sans texte (« □ » seul) : pas de carte
const cards = computed(() => (grid.value?.content ?? []).slice(1).flatMap((row, r) => {
  const cells = row.content ?? []
  const vertebra = cellText(cells[0] ?? {}).trim()
  return cells.slice(1).flatMap((cell, c): Card[] => {
    const text = cellText(cell).trim()
    const label = text.slice(1).trim()
    if (!SYMBOL.test(text) || !label) return []
    return [{ row: r + 1, col: c + 1, symbol: text[0]!, vertebra, level: `N${c}`, label }]
  })
}))

const columns = computed(() => states.map(state => ({ ...state, cards: cards.value.filter(card => card.symbol === state.symbol) })))

function setState(card: Card, symbol: string) {
  const doc: JSONContent = JSON.parse(JSON.stringify(content.value))
  const table = doc.content!.find(node => node.type === 'table')!
  const node = firstText(table.content![card.row]!.content![card.col]!)!
  node.text = node.text!.replace(SYMBOL, `$1${symbol}`)
  content.value = doc
}

const items = (card: Card): DropdownMenuItem[] => states
  .filter(state => state.symbol !== card.symbol)
  .map(state => ({ label: state.label, icon: state.icon, onSelect: () => setState(card, state.symbol) }))
</script>

<template>
  <p
    v-if="!grid"
    class="text-sm text-muted"
  >
    Pas de grille dans cette page : le kanban lit le premier tableau de la Colonne.
  </p>
  <div
    v-else
    class="grid gap-4 sm:grid-cols-3"
  >
    <div
      v-for="column in columns"
      :key="column.symbol"
      class="space-y-2 rounded-lg bg-elevated/50 p-3"
    >
      <div class="flex items-center gap-2 text-sm font-medium">
        <UIcon :name="column.icon" />
        {{ column.label }}
        <UBadge
          :label="String(column.cards.length)"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>
      <UDropdownMenu
        v-for="card in column.cards"
        :key="`${card.row}-${card.col}`"
        :items="items(card)"
      >
        <button
          type="button"
          class="w-full rounded-md border border-default bg-default p-2 text-left hover:bg-elevated"
        >
          <span class="block text-xs text-muted">{{ card.vertebra }} · {{ card.level }}</span>
          <span class="block text-sm">{{ card.label }}</span>
        </button>
      </UDropdownMenu>
      <p
        v-if="!column.cards.length"
        class="text-xs text-muted"
      >
        Aucune tranche
      </p>
    </div>
  </div>
</template>
