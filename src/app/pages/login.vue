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
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-xl font-bold">
          wiki.dev
        </h1>
      </template>
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
          label="Connexion"
          type="submit"
          block
          :loading="loading"
        />
      </UForm>
    </UCard>
  </div>
</template>
