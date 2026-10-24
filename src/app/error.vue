<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { fetch: refreshSession } = useUserSession()
const route = useRoute()
const expired = computed(() => props.error.statusCode === 401)

const messages: Record<number, string> = {
  401: 'Session expirée, redirection vers la connexion…',
  404: 'Cette page n\'existe pas ou a été supprimée.'
}
const message = computed(() => messages[props.error.statusCode ?? 500] ?? 'Une erreur est survenue, réessaie plus tard.')

// Session expirée : on vide l'état local (sinon le middleware renvoie vers l'accueil) puis retour au login
onMounted(async () => {
  if (!expired.value) return
  await refreshSession()
  await clearError({ redirect: `/login?redirect=${encodeURIComponent(route.fullPath)}` })
})
</script>

<template>
  <UApp>
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm border border-default">
        <h1 class="px-4 py-3 border-b border-default text-sm font-semibold tracking-wider text-primary uppercase">
          Erreur {{ error.statusCode }}
        </h1>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted">
            {{ message }}
          </p>
          <UButton
            v-if="!expired"
            label="Retour à l'accueil"
            block
            @click="clearError({ redirect: '/' })"
          />
        </div>
      </div>
    </div>
  </UApp>
</template>
