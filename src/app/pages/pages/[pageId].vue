<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/core'
import type { EditorCustomHandlers, EditorSuggestionMenuItem, EditorToolbarItem } from '@nuxt/ui'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { CodeBlock } from '~/editor/code-block'
import { ColonneState } from '~/editor/colonne-state'

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
// Page pas encore nommée (titre par défaut, y compris un projet pré-rempli) : titre sélectionné pour la nommer tout de suite
const titleInput = useTemplateRef('titleInput')
onMounted(() => {
  if (title.value === 'Sans titre') titleInput.value?.inputRef?.select()
})
const section = ref(page.value!.section)
// L'espace affiché suit la page ouverte, pour qu'elle reste visible dans la sidebar
const space = ref(page.value!.space)
const currentSpace = useSpace()
watch(space, value => currentSpace.value = value, { immediate: true })

// Arborescence : liste déjà chargée par la sidebar (même clé)
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })
const parentId = ref(page.value!.parentId)
// Le parent doit être dans le même espace et la même section : changer l'un ou l'autre remet la page à la racine
watch([space, section], () => parentId.value = null)

const pagesById = computed(() => new Map((pages.value ?? []).map(p => [p.id, p])))
const ancestors = computed(() => {
  const chain = []
  let id = parentId.value
  while (id && chain.length < 50) {
    const parent = pagesById.value.get(id)
    if (!parent) break
    chain.unshift(parent)
    id = parent.parentId
  }
  return chain
})
// Niveau d'une page dans l'arbre : 1 à la racine
function levelOf(id: string) {
  let level = 1
  let parent = pagesById.value.get(id)?.parentId
  while (parent && level < 50) {
    level++
    parent = pagesById.value.get(parent)?.parentId
  }
  return level
}
// Sous-pages (tous niveaux) et hauteur de la branche : 1 si la page n'a pas de sous-page
const descendants = computed(() => {
  const ids = new Set<string>()
  let height = 1
  let level = [pageId]
  while (level.length) {
    const next = (pages.value ?? []).filter(p => level.includes(p.parentId!) && !ids.has(p.id))
    if (next.length) height++
    next.forEach(p => ids.add(p.id))
    level = next.map(p => p.id)
  }
  return { ids, height }
})
const children = computed(() => (pages.value ?? []).filter(p => p.parentId === pageId))
const canCreateSubpage = computed(() => ancestors.value.length + 1 < MAX_PAGE_DEPTH)

// Parents possibles : même espace et même section, ni la page ni ses sous-pages (boucle),
// et assez haut pour que la branche tienne dans la limite (le parent actuel reste affiché)
const ROOT = 'root'
const parentItems = computed(() => [
  { label: 'Aucune (racine)', value: ROOT, icon: 'i-lucide-corner-left-up' },
  ...(pages.value ?? [])
    .filter(p => p.space === space.value && p.section === section.value && p.id !== pageId && !descendants.value.ids.has(p.id))
    .filter(p => p.id === parentId.value || levelOf(p.id) + descendants.value.height <= MAX_PAGE_DEPTH)
    .map(p => ({ label: p.title, value: p.id, icon: 'i-lucide-file-text' }))
])
const parentValue = computed({
  get: () => parentId.value ?? ROOT,
  set: value => parentId.value = value === ROOT ? null : value
})
const breadcrumb = computed(() => ancestors.value.map(p => ({ label: p.title, to: `/pages/${p.id}` })))

async function createSubpage() {
  try {
    const child = await $fetch('/api/pages', { method: 'POST', body: { parentId: pageId } })
    await refreshNuxtData('pages')
    await navigateTo(`/pages/${child!.id}`)
  } catch {
    toast.add({ title: 'Échec de la création de la sous-page', color: 'error' })
  }
}
// Briques à la demande (D-007) : une seule de chaque par projet, repérée par son titre (vérifié aussi par l'API)
const bricks = computed(() => [
  { brick: 'c4', title: 'C4', label: 'C4 (niveaux 1-2)', icon: 'i-lucide-network' },
  { brick: 'data', title: 'Modèle de données', label: 'Modèle de données', icon: 'i-lucide-database' },
  { brick: 'wireframes', title: 'Wireframes', label: 'Wireframes', icon: 'i-lucide-layout-template' }
].map(({ brick, title, ...item }) => ({
  ...item,
  disabled: children.value.some(child => child.title === title),
  onSelect: () => addBrick(brick)
})))

async function addBrick(brick: string) {
  try {
    const child = await $fetch('/api/pages', { method: 'POST', body: { parentId: pageId, brick } })
    await refreshNuxtData('pages')
    await navigateTo(`/pages/${child!.id}`)
  } catch {
    toast.add({ title: 'Échec de l\'ajout de la brique', color: 'error' })
  }
}

// Projet = page racine de la section Projets : son statut s'affiche en badge sur toutes ses sous-pages
const projectStatus = ref(page.value!.status ?? undefined)
const statuses = [
  { label: 'Idée', value: 'idea' as const, color: 'neutral' as const, icon: 'i-lucide-lightbulb' },
  { label: 'En cours', value: 'active' as const, color: 'primary' as const, icon: 'i-lucide-loader' },
  { label: 'Terminé', value: 'done' as const, color: 'success' as const, icon: 'i-lucide-circle-check' }
]
const isProject = computed(() => section.value === 'project' && !parentId.value)
const rootStatus = computed(() => section.value === 'project' ? statuses.find(s => s.value === ancestors.value[0]?.status) : undefined)

const sections = [
  { label: 'Projets', value: 'project' as const },
  { label: 'Documentation', value: 'doc' as const }
]
const confirmDelete = ref(false)
// Un projet part avec toute sa branche ; une autre page fait remonter ses sous-pages d'un niveau (API)
const deleteDescription = computed(() => {
  const removed = descendants.value.ids.size
  if (isProject.value && removed) return `La suppression est définitive, ${removed > 1 ? `ses ${removed} sous-pages comprises` : 'sa sous-page comprise'}.`
  if (children.value.length) return `La suppression est définitive. ${children.value.length > 1 ? `Ses ${children.value.length} sous-pages remonteront` : 'Sa sous-page remontera'} d'un niveau.`
  return 'La suppression est définitive.'
})

const extensions = [
  CodeBlock,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit.configure({ table: { resizable: false } }),
  ColonneState
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

// Actions sur le tableau : grisées hors d'un tableau (can() échoue) ; count : ajouts en une fois
type TableCommand = 'addRowAfter' | 'addColumnAfter' | 'deleteRow' | 'deleteColumn' | 'deleteTable'
function tableHandler(command: TableCommand) {
  return {
    canExecute: (editor: Editor) => editor.can()[command](),
    // Une transaction par ajout : enchaînées dans une seule, les colonnes suivantes échouent (structure du tableau périmée).
    // L'historique les regroupe : un seul Ctrl+Z
    execute: (editor: Editor, item?: { count?: number }) => {
      for (let i = 1; i < (item?.count ?? 1); i++) editor.chain().focus()[command]().run()
      return editor.chain().focus()[command]()
    },
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
  deleteTable: tableHandler('deleteTable'),
  // Petites briques de la méthode (menu « / » des pages de Projets)
  sliceBlock: {
    canExecute: () => true,
    execute: (editor: Editor) => editor.chain().focus().insertContent(sliceBlock()),
    isActive: () => false
  },
  journalEntry: {
    canExecute: () => true,
    execute: (editor: Editor) => editor.chain().focus().insertContent(journalEntry(new Date().toISOString().slice(0, 10))),
    isActive: () => false
  }
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
      {
        icon: 'i-lucide-between-horizontal-start',
        label: 'Ajouter des lignes',
        children: [1, 2, 3].map(count => ({ kind: 'addRowAfter' as const, count, label: count > 1 ? `${count} lignes` : '1 ligne' }))
      },
      {
        icon: 'i-lucide-between-vertical-start',
        label: 'Ajouter des colonnes',
        children: [1, 2, 3].map(count => ({ kind: 'addColumnAfter' as const, count, label: count > 1 ? `${count} colonnes` : '1 colonne' }))
      },
      { kind: 'deleteRow', icon: 'i-lucide-rows-3', label: 'Supprimer la ligne' },
      { kind: 'deleteColumn', icon: 'i-lucide-columns-3', label: 'Supprimer la colonne' },
      { kind: 'deleteTable', icon: 'i-lucide-trash-2', label: 'Supprimer le tableau' }
    ]
  }]
]

const suggestionItems = computed<EditorSuggestionMenuItem<typeof handlers>[][]>(() => [
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
  ],
  ...(section.value === 'project'
    ? [[
        { type: 'label' as const, label: 'Méthode' },
        { kind: 'sliceBlock' as const, label: 'Checklist de tranche', icon: 'i-lucide-list-todo' },
        { kind: 'journalEntry' as const, label: 'Entrée de journal', icon: 'i-lucide-notebook-pen' }
      ]]
    : [])
])

// Sauvegarde automatique : 1 s après la dernière modification
type SaveStatus = 'saved' | 'pending' | 'saving' | 'error'
const status = ref<SaveStatus>('saved')
const statusDisplay = {
  saved: { label: 'Enregistré', icon: 'i-lucide-cloud-check' },
  pending: { label: 'Modifié', icon: 'i-lucide-cloud' },
  saving: { label: 'Enregistrement…', icon: 'i-lucide-loader-circle' },
  error: { label: 'Échec, réessayer', icon: 'i-lucide-cloud-alert' }
}
const displayedStatus = computed(() => uploading.value
  ? { label: 'Envoi de l\'image…', icon: 'i-lucide-loader-circle' }
  : statusDisplay[status.value])
let timer: ReturnType<typeof setTimeout> | undefined
let dirty = false
let current: Promise<void> | undefined

watch([title, content, section, space, parentId, projectStatus], () => {
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
    body: { title: title.value.trim() || undefined, content: content.value ?? undefined, section: section.value, space: space.value, parentId: parentId.value, status: projectStatus.value }
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
          ref="titleInput"
          v-model="title"
          placeholder="Titre"
          aria-label="Titre"
          variant="none"
          size="xl"
          class="w-full"
          :ui="{ base: 'text-3xl font-bold px-0' }"
        />

        <!-- Statut du projet, arborescence : chemin, page parente, sous-page -->
        <div class="flex flex-wrap items-center gap-2">
          <USelect
            v-if="isProject"
            v-model="projectStatus"
            :items="statuses"
            :icon="statuses.find(s => s.value === projectStatus)?.icon ?? 'i-lucide-circle-dashed'"
            placeholder="Statut"
            aria-label="Statut du projet"
            size="sm"
            variant="soft"
            class="w-32"
          />
          <UBadge
            v-else-if="rootStatus"
            :label="rootStatus.label"
            :icon="rootStatus.icon"
            :color="rootStatus.color"
            variant="subtle"
          />
          <UBreadcrumb
            v-if="breadcrumb.length"
            :items="breadcrumb"
            class="min-w-0"
          />
          <USelectMenu
            v-model="parentValue"
            :items="parentItems"
            value-key="value"
            :search-input="{ placeholder: 'Chercher une page…' }"
            aria-label="Page parente"
            icon="i-lucide-folder-tree"
            size="sm"
            variant="ghost"
            class="w-56"
          />
          <UButton
            icon="i-lucide-file-plus"
            label="Sous-page"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="!canCreateSubpage"
            :title="canCreateSubpage ? undefined : `Arborescence limitée à ${MAX_PAGE_DEPTH} niveaux`"
            @click="createSubpage"
          />
          <UDropdownMenu
            v-if="isProject"
            :items="bricks"
          >
            <UButton
              icon="i-lucide-blocks"
              label="Brique"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </UDropdownMenu>
        </div>

        <!-- Sous-pages directes -->
        <div
          v-if="children.length"
          class="flex flex-wrap items-center gap-1"
        >
          <UButton
            v-for="child in children"
            :key="child.id"
            :to="`/pages/${child.id}`"
            :label="child.title"
            icon="i-lucide-file-text"
            color="neutral"
            variant="soft"
            size="xs"
          />
        </div>

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
        :title="isProject ? 'Supprimer le projet ?' : 'Supprimer la page ?'"
        :description="deleteDescription"
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
