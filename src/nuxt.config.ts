// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxthub/core', 'nuxt-auth-utils'],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'wiki.dev',
      // Marque ◧ (état « en cours » de la méthode Colonne)
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  css: ['~/assets/css/main.css'],
  // Thème terminal : sombre par défaut, clair au choix (sélecteur de thème, pas de « system »).
  // Cookie : lu au rendu serveur, la bonne classe est posée dès le HTML (comme l'espace et le thème)
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    storage: 'cookie',
    storageKey: 'wiki-color-mode'
  },
  runtimeConfig: {
    adminPasswordHash: '',
    // Hash SHA-256 du jeton MCP (NUXT_MCP_TOKEN_HASH, généré par pnpm mcp-token)
    mcpTokenHash: '',
    // Cookie gardé 7 jours, prolongé à chaque visite par server/middleware/auth.ts
    // password : fourni par NUXT_SESSION_PASSWORD
    session: {
      password: '',
      cookie: { maxAge: 60 * 60 * 24 * 7 }
    }
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
