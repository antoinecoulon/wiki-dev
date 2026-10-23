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
    <div class="w-full max-w-xs space-y-8">
      <div class="space-y-3">
        <!-- Marque ◧, à l'encre du dernier espace affiché -->
        <svg
          viewBox="0 0 16 16"
          class="size-10 text-primary"
          aria-hidden="true"
        >
          <rect
            x="1.75"
            y="1.75"
            width="12.5"
            height="12.5"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M1.75 3.25a1.5 1.5 0 0 1 1.5-1.5H8v12.5H3.25a1.5 1.5 0 0 1-1.5-1.5z"
            fill="currentColor"
          />
        </svg>
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          wiki.dev
        </h1>
        <p class="text-muted">
          Notes et projets de dev, perso et pro.
        </p>
      </div>
      <UForm
        :validate="validate"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Mot de passe"
          name="password"
        >
          <UInput
            v-model="state.password"
            type="password"
            autofocus
            class="w-full"
          />
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
</template>
