// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // typescript
  typescript: {
    typeCheck: false,
    strict: true,
  },

  modules: [
    '@nuxt/ui',
    '@nuxthub/core',
    '@nuxt/eslint',
    'nuxt-auth-utils'
  ],

  runtimeConfig: {
    adminPasswordHash: '',
  },

  // nuxt/ui
  css: ['~/assets/css/main.css'],

  // NuxtHub
  hub: {
    db: "sqlite"
  },
})