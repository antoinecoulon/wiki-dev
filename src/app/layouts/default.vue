<script setup lang="ts">
import type { CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

// Clé fixe : les pages rafraîchissent la liste avec refreshNuxtData('pages')
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })
const { clear } = useUserSession()
const collapsed = ref(false)

const sections = [
  { value: 'project' as const, label: 'Projets', icon: 'i-lucide-folder-kanban' },
  { value: 'doc' as const, label: 'Documentation', icon: 'i-lucide-book-open' }
]

const groups = computed(() => sections.map(section => ({
  ...section,
  items: (pages.value ?? [])
    .filter(page => page.section === section.value)
    .map((page): NavigationMenuItem => ({
      label: page.title,
      icon: section.icon,
      to: `/pages/${page.id}`
    }))
})))

// Mêmes groupes que la sidebar, au format attendu par la palette (id requis)
const searchGroups = computed(() => groups.value.map(group => ({
  id: group.value,
  label: group.label,
  items: group.items.map(({ label, icon, to }): CommandPaletteItem => ({ label, icon, to }))
})))

async function createPage(section: typeof sections[number]['value']) {
  const page = await $fetch('/api/pages', { method: 'POST', body: { section } })
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
        <UButton
          v-if="collapsed"
          icon="i-lucide-library"
          to="/"
          color="neutral"
          variant="ghost"
          square
          aria-label="Accueil"
        />
        <NuxtLink
          v-else
          to="/"
          class="font-bold truncate"
        >
          wiki.dev
        </NuxtLink>
      </template>

      <template #default>
        <UDashboardSearchButton
          label="Rechercher"
          :collapsed="collapsed"
          :tooltip="collapsed"
        />
        <div
          v-for="group in groups"
          :key="group.value"
        >
          <div
            v-if="!collapsed"
            class="flex items-center justify-between px-2.5 py-1"
          >
            <span class="text-xs font-semibold text-muted uppercase">
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
