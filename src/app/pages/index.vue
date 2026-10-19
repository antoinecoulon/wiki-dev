<script setup lang="ts">
const { data: pages, refresh } = await useFetch('/api/pages')
const { clear } = useUserSession()

async function logout() {
  await clear()
  await navigateTo('/login')
}

async function createPage() {
  await $fetch('/api/pages', { method: 'POST' })
  await refresh()
}
</script>

<template>
  <UContainer class="py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        wiki.dev
      </h1>
      <UButton
        icon="i-lucide-log-out"
        label="Se déconnecter"
        color="neutral"
        variant="ghost"
        @click="logout"
      />
    </div>
    <UButton
      icon="i-lucide-plus"
      label="Nouvelle page"
      @click="createPage"
    />
    <ul>
      <li
        v-for="page in pages"
        :key="page.id"
      >
        {{ page.title }} · {{ page.createdAt }}
      </li>
    </ul>
  </UContainer>
</template>
