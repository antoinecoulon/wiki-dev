<script setup lang="ts">
async function createPage() {
  const page = await $fetch('/api/pages', { method: 'POST' })
  await refreshNuxtData('pages')
  await navigateTo(`/pages/${page!.id}`)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Accueil" />
    </template>

    <template #body>
      <div class="h-full flex flex-col items-center justify-center gap-4 text-center">
        <p class="text-muted">
          Choisis une page dans la barre latérale, ou crées-en une.
        </p>
        <UButton
          icon="i-lucide-plus"
          label="Nouvelle page"
          @click="createPage"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
