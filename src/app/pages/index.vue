<script setup lang="ts">
const space = useSpace()
// Liste déjà chargée par la sidebar (même clé), triée par date de modification décroissante
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })

const spacePages = computed(() => (pages.value ?? []).filter(page => page.space === space.value))

// Projets = pages racines de la section Projets ; activité = dernière modification dans toute la branche
const recentProjects = computed(() => {
  const byId = new Map(spacePages.value.map(page => [page.id, page]))
  const lastUpdate = new Map<string, string>()
  for (const page of spacePages.value) {
    if (page.section !== 'project') continue
    let root = page
    while (root.parentId && byId.has(root.parentId)) root = byId.get(root.parentId)!
    if (page.updatedAt > (lastUpdate.get(root.id) ?? '')) lastUpdate.set(root.id, page.updatedAt)
  }
  return [...lastUpdate]
    .sort(([, a], [, b]) => b.localeCompare(a))
    .slice(0, 6)
    .map(([id, updatedAt]) => ({ ...byId.get(id)!, lastUpdate: updatedAt }))
})

const recentPages = computed(() => spacePages.value.slice(0, 8))

async function createPage() {
  const page = await $fetch('/api/pages', { method: 'POST', body: { space: space.value } })
  await refreshNuxtData('pages')
  await navigateTo(`/pages/${page!.id}`)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Accueil">
        <template #right>
          <UButton
            icon="i-lucide-plus"
            label="Nouvelle page"
            :ui="{ label: 'max-sm:hidden' }"
            aria-label="Nouvelle page"
            @click="createPage"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        v-if="!spacePages.length"
        class="h-full flex flex-col items-center justify-center gap-4 text-center"
      >
        <p class="text-muted">
          Aucune page dans cet espace pour l'instant.
        </p>
        <UButton
          icon="i-lucide-plus"
          label="Nouvelle page"
          @click="createPage"
        />
      </div>

      <UContainer
        v-else
        class="space-y-8 py-4"
      >
        <section
          v-if="recentProjects.length"
          class="space-y-3"
        >
          <h2 class="font-semibold text-highlighted">
            Projets récents
          </h2>
          <UPageGrid class="lg:grid-cols-3 gap-4">
            <UPageCard
              v-for="project in recentProjects"
              :key="project.id"
              :to="`/pages/${project.id}`"
              :title="project.title"
              icon="i-lucide-folder-kanban"
              variant="subtle"
            >
              <template #description>
                Modifié <NuxtTime
                  :datetime="project.lastUpdate"
                  relative
                  locale="fr"
                />
              </template>
            </UPageCard>
          </UPageGrid>
        </section>

        <section class="space-y-3">
          <h2 class="font-semibold text-highlighted">
            Pages récentes
          </h2>
          <ul class="divide-y divide-default rounded-md border border-default">
            <li
              v-for="page in recentPages"
              :key="page.id"
            >
              <NuxtLink
                :to="`/pages/${page.id}`"
                class="flex items-center gap-3 px-3 py-2 hover:bg-elevated/50"
              >
                <UIcon
                  :name="page.section === 'project' ? 'i-lucide-folder-kanban' : 'i-lucide-book-open'"
                  class="size-4 shrink-0 text-muted"
                />
                <span class="flex-1 truncate">{{ page.title }}</span>
                <NuxtTime
                  :datetime="page.updatedAt"
                  relative
                  locale="fr"
                  class="text-sm text-muted shrink-0"
                />
              </NuxtLink>
            </li>
          </ul>
        </section>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
