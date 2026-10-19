<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Clé fixe : les pages rafraîchissent la liste avec refreshNuxtData('pages')
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })
const { clear } = useUserSession()

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
    <UDashboardSidebar
      resizable
      collapsible
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="font-bold truncate"
        >
          {{ collapsed ? 'w.' : 'wiki.dev' }}
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
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
            orientation="vertical"
          />
        </div>
      </template>

      <template #footer="{ collapsed }">
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

    <slot />
  </UDashboardGroup>
</template>
