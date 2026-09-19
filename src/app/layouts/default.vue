<script setup lang="ts">
const toast = useToast()
const { loggedIn } = useUserSession()

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    toast.add({
      title: 'Déconnecté',
      description: 'Vous avez été déconnecté avec succès.',
      color: 'success'
    })
  } catch {
    toast.add({ 
      title: 'Erreur lors de la déconnextion',
      description: 'Erreur innatendue, réessayez.',
      color: 'error'
    })
  }
}
</script>


<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <UHeader title="wiki.dev" class="shrink-0 border-b-secondary">
      <template #right>
        <UButton
          v-if="loggedIn"
          label="Déconnexion"
          color="error"
          @click="handleLogout"
        />
      </template>
    </UHeader>
    <slot />
  </div>
</template>