<script setup lang="ts">
import type { JSONContent } from '@tiptap/core'

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
const saving = ref(false)
const confirmDelete = ref(false)

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/pages/${pageId}`, {
      method: 'PATCH',
      body: { title: title.value, content: content.value ?? undefined }
    })
    await refreshNuxtData('pages')
    toast.add({ title: 'Page enregistrée', color: 'success' })
  } catch {
    toast.add({ title: 'Échec de l\'enregistrement', description: 'Tes modifications sont toujours à l\'écran, réessaie.', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function remove() {
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
            icon="i-lucide-trash-2"
            label="Supprimer"
            color="error"
            variant="ghost"
            @click="confirmDelete = true"
          />
          <UButton
            icon="i-lucide-save"
            label="Enregistrer"
            :loading="saving"
            :disabled="!title.trim()"
            @click="save"
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
          v-model="content"
          content-type="json"
          placeholder="Écris ici…"
          class="min-h-64"
        />
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
