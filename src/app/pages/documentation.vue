<script setup lang="ts">
const space = useSpace()
// Liste déjà chargée par la sidebar (même clé), triée par date de modification décroissante
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })

const docPages = computed(() => (pages.value ?? []).filter(page => page.space === space.value && page.section === 'doc'))
const spaceLabel = computed(() => spaces.find(s => s.value === space.value)?.label ?? '')

// Tags de la doc de l'espace, du plus utilisé au moins utilisé
const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const page of docPages.value) {
    for (const tag of page.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
})

// Plusieurs tags sélectionnés : la page doit les avoir tous
const selected = ref<string[]>([])
watch(space, () => selected.value = [])
function toggle(tag: string) {
  selected.value = selected.value.includes(tag) ? selected.value.filter(t => t !== tag) : [...selected.value, tag]
}
const filtered = computed(() => docPages.value.filter(page => selected.value.every(tag => page.tags.includes(tag))))
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <span class="text-sm uppercase">
            <span class="text-muted">{{ spaceLabel }} /</span> Documentation
          </span>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="space-y-6 py-4">
        <section
          v-if="tagCounts.length"
          class="border border-default"
        >
          <h2 class="flex items-center justify-between px-4 py-3 border-b border-default text-sm font-semibold tracking-wider text-primary uppercase">
            Tags
            <UButton
              v-if="selected.length"
              label="Tout afficher"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="selected = []"
            />
          </h2>
          <div class="flex flex-wrap gap-2 p-4">
            <UButton
              v-for="[tag, count] in tagCounts"
              :key="tag"
              :label="`#${tag} ${count}`"
              :color="selected.includes(tag) ? 'primary' : 'neutral'"
              :variant="selected.includes(tag) ? 'solid' : 'outline'"
              size="xs"
              class="normal-case tracking-normal"
              :aria-pressed="selected.includes(tag)"
              @click="toggle(tag)"
            />
          </div>
        </section>

        <section class="border border-default">
          <h2 class="px-4 py-3 border-b border-default text-sm font-semibold tracking-wider text-primary uppercase">
            Pages <span class="text-muted">{{ filtered.length }}</span>
          </h2>
          <p
            v-if="!filtered.length"
            class="px-4 py-3 text-sm text-muted"
          >
            {{ docPages.length ? 'Aucune page avec ces tags.' : 'Aucune page de documentation dans cet espace.' }}
          </p>
          <ul v-else>
            <li
              v-for="page in filtered"
              :key="page.id"
            >
              <NuxtLink
                :to="`/pages/${page.id}`"
                class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 hover:bg-elevated"
              >
                <span class="flex-1 min-w-40 truncate text-highlighted">{{ page.title }}</span>
                <span
                  v-if="page.tags.length"
                  class="text-xs text-muted"
                >
                  {{ page.tags.map(tag => `#${tag}`).join(' ') }}
                </span>
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
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
