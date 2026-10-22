<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/core'
import type { EditorCustomHandlers, EditorSuggestionMenuItem, EditorToolbarItem } from '@nuxt/ui'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { CodeBlock } from '~/editor/code-block'

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
// L'espace affiché suit la page ouverte, pour qu'elle reste visible dans la sidebar
const space = ref(page.value!.space)
const currentSpace = useSpace()
watch(space, value => currentSpace.value = value, { immediate: true })
const sections = [
  { label: 'Projets', value: 'project' as const },
  { label: 'Documentation', value: 'doc' as const }
]
const confirmDelete = ref(false)

const extensions = [
  CodeBlock,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit.configure({ table: { resizable: false } })
]

// Images : envoyées à /api/images (store Vercel Blob privé), insérées une fois enregistrées
type EditorView = Editor['view']
const MAX_IMAGE_SIZE = 4 * 1024 * 1024
const uploading = ref(0)
const fileInput = useTemplateRef('fileInput')
let pickerView: EditorView | undefined

// Contenu copié ou déplacé depuis l'éditeur (data-pm-slice) : le navigateur y joint l'image
// comme fichier ; on laisse ProseMirror faire, sinon l'image serait réuploadée
const editorProps = {
  handlePaste(view: EditorView, event: ClipboardEvent) {
    const files = Array.from(event.clipboardData?.files ?? [])
    if (!files.length || event.clipboardData?.getData('text/html').includes('data-pm-slice')) return false
    files.forEach(file => uploadImage(view, file, view.state.selection.from))
    return true
  },
  handleDrop(view: EditorView, event: DragEvent, _slice: unknown, moved: boolean) {
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (moved || !files.length || event.dataTransfer?.types.includes('application/x-prosemirror-slice')) return false
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from
    files.forEach(file => uploadImage(view, file, pos))
    return true
  }
}

async function uploadImage(view: EditorView, file: File, pos: number) {
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Fichier ignoré', description: `${file.name} n'est pas une image.`, color: 'error' })
    return
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.add({ title: 'Image trop lourde', description: `${file.name} dépasse 4 Mo.`, color: 'error' })
    return
  }
  uploading.value++
  try {
    const body = new FormData()
    body.append('file', file)
    const { src } = await $fetch('/api/images', { method: 'POST', body })
    // Le document a pu changer pendant l'envoi
    const { state } = view
    const at = Math.min(pos, state.doc.content.size)
    view.dispatch(state.tr.insert(at, state.schema.nodes.image!.create({ src, alt: file.name })))
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Échec de l\'envoi de l\'image', description: message, color: 'error' })
  } finally {
    uploading.value--
  }
}

function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement
  const view = pickerView
  if (view) {
    for (const file of input.files ?? []) uploadImage(view, file, view.state.selection.from)
  }
  input.value = ''
}

// Actions sur le tableau : grisées hors d'un tableau (can() échoue)
type TableCommand = 'addRowAfter' | 'addColumnAfter' | 'deleteRow' | 'deleteColumn' | 'deleteTable'
function tableHandler(command: TableCommand) {
  return {
    canExecute: (editor: Editor) => editor.can()[command](),
    execute: (editor: Editor) => editor.chain().focus()[command](),
    isActive: () => false
  }
}

// Bouton Image (barre et menu « / ») : choisir un fichier au lieu de saisir une URL
const handlers = {
  image: {
    canExecute: () => true,
    execute: (editor) => {
      pickerView = editor.view
      fileInput.value?.click()
      return editor.chain()
    },
    isActive: (editor: Editor) => editor.isActive('image')
  },
  table: {
    canExecute: (editor: Editor) => editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    execute: (editor: Editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    isActive: (editor: Editor) => editor.isActive('table')
  },
  addRowAfter: tableHandler('addRowAfter'),
  addColumnAfter: tableHandler('addColumnAfter'),
  deleteRow: tableHandler('deleteRow'),
  deleteColumn: tableHandler('deleteColumn'),
  deleteTable: tableHandler('deleteTable')
} satisfies EditorCustomHandlers

const toolbarItems: EditorToolbarItem<typeof handlers>[][] = [
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
    { kind: 'horizontalRule', icon: 'i-lucide-separator-horizontal', tooltip: { text: 'Séparateur' } },
    { kind: 'image', icon: 'i-lucide-image', tooltip: { text: 'Image' } }
  ],
  [{
    icon: 'i-lucide-table',
    tooltip: { text: 'Tableau' },
    content: { align: 'start' },
    items: [
      { kind: 'table', icon: 'i-lucide-table', label: 'Insérer un tableau' },
      { kind: 'addRowAfter', icon: 'i-lucide-between-horizontal-start', label: 'Ajouter une ligne' },
      { kind: 'addColumnAfter', icon: 'i-lucide-between-vertical-start', label: 'Ajouter une colonne' },
      { kind: 'deleteRow', icon: 'i-lucide-rows-3', label: 'Supprimer la ligne' },
      { kind: 'deleteColumn', icon: 'i-lucide-columns-3', label: 'Supprimer la colonne' },
      { kind: 'deleteTable', icon: 'i-lucide-trash-2', label: 'Supprimer le tableau' }
    ]
  }]
]

const suggestionItems: EditorSuggestionMenuItem<typeof handlers>[][] = [
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
    { kind: 'horizontalRule', label: 'Séparateur', icon: 'i-lucide-separator-horizontal' },
    { kind: 'image', label: 'Image', icon: 'i-lucide-image' },
    { kind: 'table', label: 'Tableau', icon: 'i-lucide-table' }
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
const displayedStatus = computed(() => uploading.value
  ? { label: 'Envoi de l\'image…', icon: 'i-lucide-loader-circle' }
  : statusDisplay[status.value])
let timer: ReturnType<typeof setTimeout> | undefined
let dirty = false
let current: Promise<void> | undefined

watch([title, content, section, space], () => {
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
    body: { title: title.value.trim() || undefined, content: content.value ?? undefined, section: section.value, space: space.value }
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
          <!-- Sur mobile, icônes seules pour tenir sur une ligne -->
          <UButton
            :icon="displayedStatus.icon"
            :label="displayedStatus.label"
            :aria-label="displayedStatus.label"
            :color="status === 'error' ? 'error' : 'neutral'"
            variant="ghost"
            size="sm"
            :disabled="status !== 'error'"
            :ui="{ leadingIcon: status === 'saving' || uploading ? 'animate-spin' : '', label: 'max-sm:hidden' }"
            @click="flush"
          />
          <USelect
            v-model="space"
            :items="spaces"
            aria-label="Espace"
            class="w-24"
          />
          <USelect
            v-model="section"
            :items="sections"
            aria-label="Section"
            class="w-32 sm:w-40"
          />
          <UButton
            icon="i-lucide-trash-2"
            label="Supprimer"
            aria-label="Supprimer"
            color="error"
            variant="ghost"
            :ui="{ label: 'max-sm:hidden' }"
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
          :handlers="handlers"
          :editor-props="editorProps"
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
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          class="hidden"
          @change="onFilePicked"
        >
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
