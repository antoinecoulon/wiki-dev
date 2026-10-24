<script setup lang="ts">
import type { CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

// Clé fixe : les pages rafraîchissent la liste avec refreshNuxtData('pages')
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })
const { clear } = useUserSession()
const route = useRoute()
const collapsed = ref(false)
const space = useSpace()
const currentSpace = computed(() => spaces.find(s => s.value === space.value) ?? spaces[0]!)
const otherSpace = computed(() => spaces.find(s => s.value !== space.value)!)

const sections = [
  { value: 'project' as const, label: 'Projets', icon: 'i-lucide-folder-kanban' },
  { value: 'doc' as const, label: 'Documentation', icon: 'i-lucide-book-open' }
]

type Page = NonNullable<typeof pages.value>[number]

// Pages de l'espace affiché, par section
const visiblePages = computed(() => sections.map(section => ({
  ...section,
  pages: (pages.value ?? []).filter(page => page.space === space.value && page.section === section.value)
})))

// Branches ouvertes au chargement : les parents de la page affichée
const openIds = computed(() => {
  const byId = new Map((pages.value ?? []).map(page => [page.id, page]))
  const ids = new Set<string>()
  let parentId = byId.get(route.params.pageId as string)?.parentId
  while (parentId && !ids.has(parentId)) {
    ids.add(parentId)
    parentId = byId.get(parentId)?.parentId
  }
  return ids
})

// Arborescence : une page dont le parent n'est pas dans le groupe est affichée à la racine
const groups = computed(() => visiblePages.value.map((group) => {
  const ids = new Set(group.pages.map(page => page.id))
  const toItem = (page: Page): NavigationMenuItem => {
    const children = group.pages.filter(child => child.parentId === page.id).map(toItem)
    return {
      label: page.title,
      icon: group.icon,
      to: `/pages/${page.id}`,
      children: children.length ? children : undefined,
      defaultOpen: openIds.value.has(page.id)
    }
  }
  return {
    ...group,
    items: group.pages.filter(page => !page.parentId || !ids.has(page.parentId)).map(toItem)
  }
}))

// Accès rapide en haut de la sidebar, pour l'espace affiché : favoris, puis les 5 pages modifiées en dernier (API triée par date)
const shortcuts = computed(() => {
  const inSpace = (pages.value ?? []).filter(page => page.space === space.value)
  const toItem = (icon: string) => (page: Page): NavigationMenuItem => ({ label: page.title, icon, to: `/pages/${page.id}` })
  return [
    { label: 'Favoris', items: inSpace.filter(page => page.favorite).map(toItem('i-lucide-star')) },
    { label: 'Récentes', items: inSpace.slice(0, 5).map(toItem('i-lucide-clock')) }
  ].filter(group => group.items.length)
})

// Toutes les pages de l'espace, à plat, au format attendu par la palette (id requis)
const searchGroups = computed(() => visiblePages.value.map(group => ({
  id: group.value,
  label: group.label,
  // Tags en suffixe : affichés, et cherchés par la palette (label, description, suffix)
  items: group.pages.map((page): CommandPaletteItem => ({ label: page.title, suffix: page.tags.map(tag => `#${tag}`).join(' ') || undefined, icon: group.icon, to: `/pages/${page.id}` }))
})))

async function createPage(section: typeof sections[number]['value']) {
  const page = await $fetch('/api/pages', { method: 'POST', body: { section, space: space.value } })
  await refreshNuxtData('pages')
  await navigateTo(`/pages/${page!.id}`)
}

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <UDashboardGroup>
    <!-- Repliée, la barre de défilement mange la colonne d'icônes : on la masque (la molette reste active) -->
    <UDashboardSidebar
      v-model:collapsed="collapsed"
      resizable
      collapsible
      :ui="{ body: collapsed ? '[scrollbar-width:none]' : undefined }"
    >
      <template #header>
        <!-- Repliée : marque ◧ (état « en cours » de la Colonne) ; dépliée : nom et espace, façon invite de terminal -->
        <NuxtLink
          to="/"
          class="min-w-0"
          :class="collapsed ? 'mx-auto' : 'px-1'"
          :aria-label="collapsed ? 'Accueil' : undefined"
        >
          <svg
            v-if="collapsed"
            viewBox="0 0 16 16"
            class="size-5 text-primary"
            aria-hidden="true"
          >
            <rect
              x="1.75"
              y="1.75"
              width="12.5"
              height="12.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="1.75"
              y="1.75"
              width="6.25"
              height="12.5"
              fill="currentColor"
            />
          </svg>
          <template v-else>
            <span class="block text-lg font-bold tracking-widest text-primary">WIKI_DEV</span>
            <span class="block text-xs text-muted uppercase">~/{{ currentSpace.label }}</span>
          </template>
        </NuxtLink>
      </template>

      <template #default>
        <!-- Repliée : un bouton bascule vers l'autre espace ; couleur primaire pour le distinguer des pages -->
        <UTooltip
          v-if="collapsed"
          :text="`Espace ${currentSpace.label}, passer en ${otherSpace.label}`"
          :content="{ side: 'right' }"
        >
          <UButton
            :icon="currentSpace.icon"
            color="primary"
            variant="soft"
            square
            :aria-label="`Espace ${currentSpace.label}, passer en ${otherSpace.label}`"
            @click="space = otherSpace.value"
          />
        </UTooltip>
        <UTabs
          v-else
          v-model="space"
          :items="spaces"
          :content="false"
          size="xs"
          class="w-full"
        />
        <UDashboardSearchButton
          label="Rechercher"
          :collapsed="collapsed"
          :tooltip="collapsed"
        />
        <div
          v-for="group in shortcuts"
          :key="group.label"
        >
          <span
            v-if="!collapsed"
            class="block px-2.5 py-1 text-xs font-semibold tracking-wider text-muted uppercase"
          >
            {{ group.label }}
          </span>
          <UNavigationMenu
            :items="group.items"
            :collapsed="collapsed"
            tooltip
            orientation="vertical"
          />
        </div>
        <div
          v-for="group in groups"
          :key="group.value"
        >
          <div
            v-if="!collapsed"
            class="flex items-center justify-between px-2.5 py-1"
          >
            <!-- Documentation : l'en-tête mène à la liste filtrable par tag -->
            <NuxtLink
              v-if="group.value === 'doc'"
              to="/documentation"
              class="text-xs font-semibold tracking-wider text-muted uppercase hover:text-primary"
            >
              {{ group.label }}
            </NuxtLink>
            <span
              v-else
              class="text-xs font-semibold tracking-wider text-muted uppercase"
            >
              {{ group.label }}
            </span>
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              variant="ghost"
              size="xs"
              :aria-label="`Nouvelle page dans ${group.label}`"
              @click="createPage(group.value)"
            />
          </div>
          <UNavigationMenu
            :items="group.items"
            :collapsed="collapsed"
            tooltip
            orientation="vertical"
          />
        </div>
      </template>

      <template #footer>
        <UButton
          icon="i-lucide-log-out"
          :label="collapsed ? undefined : 'Se déconnecter'"
          :square="collapsed"
          color="neutral"
          variant="ghost"
          block
          @click="logout"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      :groups="searchGroups"
      :color-mode="false"
      placeholder="Rechercher une page…"
    >
      <template #empty>
        Aucune page trouvée
      </template>
    </UDashboardSearch>

    <slot />
  </UDashboardGroup>
</template>
