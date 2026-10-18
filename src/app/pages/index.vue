<script setup lang="ts">
const { data: pages, refresh } = await useFetch('/api/pages')

async function createPage() {
  await $fetch('/api/pages', { method: 'POST' })
  await refresh()
}
</script>

<template>
  <UContainer class="py-8 space-y-4">
    <h1 class="text-2xl font-bold">
      wiki.dev
    </h1>
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
