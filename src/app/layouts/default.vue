<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Clé fixe : les pages rafraîchissent la liste avec refreshNuxtData('pages')
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })
const { clear } = useUserSession()

const items = computed<NavigationMenuItem[]>(() => (pages.value ?? []).map(page => ({
  label: page.title,
  icon: 'i-lucide-file-text',
  to: `/pages/${page.id}`
})))

async function createPage() {
  const page = await $fetch('/api/pages', { method: 'POST' })
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
        <UButton
          icon="i-lucide-plus"
          :label="collapsed ? undefined : 'Nouvelle page'"
          :square="collapsed"
          color="neutral"
          variant="soft"
          block
          @click="createPage"
        />
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
        />
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
