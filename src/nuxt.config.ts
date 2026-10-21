// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxthub/core', 'nuxt-auth-utils'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    adminPasswordHash: ''
  },
  compatibilityDate: '2025-07-15',
  // Preset détecté par Nitro (Vercel) ; DB Turso via TURSO_DATABASE_URL / TURSO_AUTH_TOKEN (D-006)
  nitro: {
    // Même région que la base Turso (aws-eu-west-1) pour limiter la latence des requêtes
    vercel: { regions: ['dub1'] }
  },
  hub: {
    db: 'sqlite'
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
