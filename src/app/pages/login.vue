<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

definePageMeta({ layout: false })

const { fetch: refreshSession } = useUserSession()

const state = reactive({ password: '' })
const error = ref('')
const loading = ref(false)

function validate(state: { password: string }): FormError[] {
  return state.password ? [] : [{ name: 'password', message: 'Mot de passe requis' }]
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/login', { method: 'POST', body: state })
    await refreshSession()
    await navigateTo('/')
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    error.value = status === 401 ? 'Mot de passe incorrect' : 'Connexion impossible, réessaie plus tard'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-widest text-primary">
          WIKI_DEV
        </h1>
        <p class="mt-1 text-sm text-muted">
          Notes et projets de dev, perso et pro.
        </p>
      </div>
      <!-- Panneau d'accès, façon terminal -->
      <div class="border border-default">
        <h2 class="px-4 py-3 border-b border-default text-sm font-semibold tracking-wider text-primary uppercase">
          Accès
        </h2>
        <UForm
          :validate="validate"
          :state="state"
          class="space-y-4 p-4"
          @submit="onSubmit"
        >
          <UFormField
            label="Mot de passe"
            name="password"
            :ui="{ label: 'text-xs tracking-wider text-muted uppercase' }"
          >
            <UInput
              v-model="state.password"
              type="password"
              autofocus
              class="w-full"
            >
              <template #leading>
                <span class="text-primary">#</span>
              </template>
            </UInput>
          </UFormField>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error"
          />
          <UButton
            label="Se connecter"
            type="submit"
            block
            :loading="loading"
          />
        </UForm>
      </div>
    </div>
  </div>
</template>
