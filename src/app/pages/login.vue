<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';

const toast = useToast()

const state = reactive({ password: undefined })
type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.password) errors.push({ name: 'password', message: 'Mot de passe requis' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const body = event.data
  
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body
    })
    
    toast.add({ 
      title: 'Connecté',
      description: 'Bonjour Antoine !',
      color: 'success'
    })
    await navigateTo('/')
  } catch {
    toast.add({ 
      title: 'Erreur de connextion',
      description: 'Impossible de se connecter.',
      color: 'error'
    })
  }

}
</script>


<template>
  <div class="h-full flex items-center justify-center">
    <UCard class="p-8">
      <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Mot de passe" name="password" size="lg">
          <UInput v-model="state.password" type="password" />
        </UFormField>
        <UButton label="Connexion" type="submit" />
      </UForm>
    </UCard>
  </div>
</template>