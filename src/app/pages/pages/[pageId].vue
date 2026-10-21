<script setup lang="ts">
import type { JSONContent } from '@tiptap/core'
import type { EditorSuggestionMenuItem, EditorToolbarItem } from '@nuxt/ui'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
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

// Recrée le composant à chaque page : sinon titre et contenu restent ceux de la page précédente
definePageMeta({ key: route => route.fullPath })

const route = useRoute('pages-pageId')
const toast = useToast()
const pageId = route.params.pageId

const { data: page, error } = await useFetch(`/api/pages/${pageId}`)
if (error.value) {
  throw createError({ status: error.value.statusCode, statusText: error.value.statusMessage, fatal: true })
}

const title = ref(page.value!.title)
const content = ref<JSONContent | null>(page.value!.content)
const section = ref(page.value!.section)
const sections = [
  { label: 'Projets', value: 'project' as const },
  { label: 'Documentation', value: 'doc' as const }
]
const confirmDelete = ref(false)

// Langage choisi dans le bloc (CodeBlockView) ; sur « Auto », lowlight détecte parmi ces langages
const lowlight = createLowlight({ bash, csharp, css, javascript, json, typescript, xml })
const extensions = [
  CodeBlockLowlight.extend({
    addNodeView: () => VueNodeViewRenderer(CodeBlockView)
  }).configure({ lowlight }),
  TaskList,
  TaskItem.configure({ nested: true })
]

const toolbarItems: EditorToolbarItem[][] = [
  [
    { kind: 'undo', icon: 'i-lucide-undo', tooltip: { text: 'Annuler' } },
    { kind: 'redo', icon: 'i-lucide-redo', tooltip: { text: 'Rétablir' } }
  ],
  [{
    icon: 'i-lucide-heading',
    tooltip: { text: 'Titres' },
    content: { align: 'start' },
    items: [
      { kind: 'paragraph', icon: 'i-lucide-type', label: 'Texte' },
      { kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Titre 1' },
      { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Titre 2' },
      { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Titre 3' }
    ]
  }],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Gras' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italique' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Barré' } },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Code' } },
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Lien' } }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Liste' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Liste numérotée' } },
    { kind: 'taskList', icon: 'i-lucide-list-checks', tooltip: { text: 'Checklist' } }
  ],
  [
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Citation' } },
    { kind: 'codeBlock', icon: 'i-lucide-square-code', tooltip: { text: 'Bloc de code' } },
    { kind: 'horizontalRule', icon: 'i-lucide-separator-horizontal', tooltip: { text: 'Séparateur' } }
  ]
]

const suggestionItems: EditorSuggestionMenuItem[][] = [
  [
    { type: 'label', label: 'Texte' },
    { kind: 'paragraph', label: 'Texte', icon: 'i-lucide-type' },
    { kind: 'heading', level: 1, label: 'Titre 1', icon: 'i-lucide-heading-1' },
    { kind: 'heading', level: 2, label: 'Titre 2', icon: 'i-lucide-heading-2' },
    { kind: 'heading', level: 3, label: 'Titre 3', icon: 'i-lucide-heading-3' }
  ],
  [
    { type: 'label', label: 'Listes' },
    { kind: 'bulletList', label: 'Liste', icon: 'i-lucide-list' },
    { kind: 'orderedList', label: 'Liste numérotée', icon: 'i-lucide-list-ordered' },
    { kind: 'taskList', label: 'Checklist', icon: 'i-lucide-list-checks' }
  ],
  [
    { type: 'label', label: 'Blocs' },
    { kind: 'blockquote', label: 'Citation', icon: 'i-lucide-text-quote' },
    { kind: 'codeBlock', label: 'Bloc de code', icon: 'i-lucide-square-code' },
    { kind: 'horizontalRule', label: 'Séparateur', icon: 'i-lucide-separator-horizontal' }
  ]
]

// Sauvegarde automatique : 1 s après la dernière modification
type SaveStatus = 'saved' | 'pending' | 'saving' | 'error'
const status = ref<SaveStatus>('saved')
const statusDisplay = {
  saved: { label: 'Enregistré', icon: 'i-lucide-check' },
  pending: { label: 'Modifié', icon: 'i-lucide-pencil' },
  saving: { label: 'Enregistrement…', icon: 'i-lucide-loader-circle' },
  error: { label: 'Échec, réessayer', icon: 'i-lucide-triangle-alert' }
}
let timer: ReturnType<typeof setTimeout> | undefined
let dirty = false
let current: Promise<void> | undefined

watch([title, content, section], () => {
  dirty = true
  status.value = 'pending'
  clearTimeout(timer)
  timer = setTimeout(flush, 1000)
}, { deep: true })

async function flush() {
  clearTimeout(timer)
  // Une seule requête à la fois : la suivante part avec l'état le plus récent
  while (current) await current
  if (!dirty) return
  dirty = false
  status.value = 'saving'
  current = $fetch(`/api/pages/${pageId}`, {
    method: 'PATCH',
    // Titre vide : refusé par l'API, on garde l'ancien en base
    body: { title: title.value.trim() || undefined, content: content.value ?? undefined, section: section.value }
  }).then(async () => {
    if (!dirty) status.value = 'saved'
    await refreshNuxtData('pages')
  }).catch(() => {
    dirty = true
    status.value = 'error'
    toast.add({ title: 'Échec de l\'enregistrement', description: 'Tes modifications sont toujours à l\'écran, réessaie.', color: 'error' })
  }).finally(() => {
    current = undefined
  })
  await current
}

onBeforeRouteLeave(async () => {
  await flush()
  if (dirty) {
    return confirm('Les dernières modifications n\'ont pas pu être enregistrées. Quitter quand même ?')
  }
})

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (dirty || current) {
    flush()
    event.preventDefault()
  }
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

async function remove() {
  clearTimeout(timer)
  dirty = false
  try {
    await $fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
    await refreshNuxtData('pages')
    await navigateTo('/')
  } catch {
    confirmDelete.value = false
    toast.add({ title: 'Échec de la suppression', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #right>
          <UButton
            :icon="statusDisplay[status].icon"
            :label="statusDisplay[status].label"
            :color="status === 'error' ? 'error' : 'neutral'"
            variant="ghost"
            size="sm"
            :disabled="status !== 'error'"
            :ui="{ leadingIcon: status === 'saving' ? 'animate-spin' : '' }"
            @click="flush"
          />
          <USelect
            v-model="section"
            :items="sections"
            aria-label="Section"
            class="w-40"
          />
          <UButton
            icon="i-lucide-trash-2"
            label="Supprimer"
            color="error"
            variant="ghost"
            @click="confirmDelete = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="space-y-4">
        <UInput
          v-model="title"
          placeholder="Titre"
          aria-label="Titre"
          variant="none"
          size="xl"
          class="w-full"
          :ui="{ base: 'text-3xl font-bold px-0' }"
        />

        <UEditor
          v-slot="{ editor }"
          v-model="content"
          content-type="json"
          placeholder="Écris ici, ou tape « / » pour insérer un bloc…"
          :starter-kit="{ codeBlock: false }"
          :extensions="extensions"
          class="min-h-64"
        >
          <UEditorToolbar
            :editor="editor"
            :items="toolbarItems"
            class="sticky top-0 z-10 bg-default border-b border-default py-2 mb-4 overflow-x-auto"
          />
          <UEditorSuggestionMenu
            :editor="editor"
            :items="suggestionItems"
          />
        </UEditor>
      </UContainer>

      <UModal
        v-model:open="confirmDelete"
        title="Supprimer la page ?"
        description="La suppression est définitive."
      >
        <template #footer>
          <UButton
            label="Annuler"
            color="neutral"
            variant="ghost"
            @click="confirmDelete = false"
          />
          <UButton
            label="Supprimer"
            color="error"
            @click="remove"
          />
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
