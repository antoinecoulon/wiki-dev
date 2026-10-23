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
    .map(([id]) => byId.get(id)!)
})

const recentPages = computed(() => spacePages.value.slice(0, 8))
const projectCount = computed(() => spacePages.value.filter(page => page.section === 'project' && !page.parentId).length)
const spaceLabel = computed(() => spaces.find(s => s.value === space.value)?.label ?? '')

// Statut en étiquette texte, façon sortie de terminal (libellés du sélecteur de statut de la page)
const statusTags = {
  idea: { label: 'IDÉE', class: 'text-muted' },
  active: { label: 'EN_COURS', class: 'text-primary' },
  done: { label: 'TERMINÉ', class: 'text-success' }
}

async function createPage() {
  const page = await $fetch('/api/pages', { method: 'POST', body: { space: space.value } })
  await refreshNuxtData('pages')
  await navigateTo(`/pages/${page!.id}`)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <span class="text-sm uppercase">
            <span class="text-muted">{{ spaceLabel }} /</span> Accueil
          </span>
        </template>
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
        class="space-y-6 py-4"
      >
        <!-- En-tête : espace et compteur en filigrane -->
        <section class="relative overflow-hidden border border-default p-6">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-wider text-primary uppercase">
            Espace {{ spaceLabel }}
          </h1>
          <p class="mt-2 text-muted">
            {{ spacePages.length }} page{{ spacePages.length > 1 ? 's' : '' }}, {{ projectCount }} projet{{ projectCount > 1 ? 's' : '' }}.
          </p>
          <span
            class="absolute right-6 top-1/2 -translate-y-1/2 text-7xl font-bold text-(--ui-border-accented) select-none max-sm:hidden"
            aria-hidden="true"
          >
            {{ String(spacePages.length).padStart(2, '0') }}
          </span>
        </section>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section
            v-if="recentProjects.length"
            class="min-w-0 border border-default lg:col-span-2 self-start"
          >
            <h2 class="px-4 py-3 border-b border-default text-sm font-semibold tracking-wider text-primary uppercase">
              Projets_récents
            </h2>
            <ul>
              <li
                v-for="project in recentProjects"
                :key="project.id"
              >
                <NuxtLink
                  :to="`/pages/${project.id}`"
                  class="flex items-center gap-3 px-4 py-2 hover:bg-elevated"
                >
                  <span class="flex-1 truncate text-highlighted">{{ project.title }}</span>
                  <span
                    v-if="project.status"
                    class="text-xs font-semibold"
                    :class="statusTags[project.status].class"
                  >
                    {{ statusTags[project.status].label }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <section
            class="min-w-0 border border-default self-start"
            :class="recentProjects.length ? 'lg:col-span-3' : 'lg:col-span-5'"
          >
            <h2 class="px-4 py-3 border-b border-default text-sm font-semibold tracking-wider text-primary uppercase">
              Pages_récentes
            </h2>
            <ul>
              <li
                v-for="page in recentPages"
                :key="page.id"
              >
                <NuxtLink
                  :to="`/pages/${page.id}`"
                  class="flex items-center gap-3 px-4 py-2 hover:bg-elevated"
                >
                  <span class="w-8 shrink-0 text-xs text-muted">{{ page.section === 'project' ? 'PRJ' : 'DOC' }}</span>
                  <span class="flex-1 truncate text-highlighted">{{ page.title }}</span>
                  <NuxtTime
                    :datetime="page.updatedAt"
                    relative
                    locale="fr"
                    class="text-xs text-muted shrink-0"
                  />
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
