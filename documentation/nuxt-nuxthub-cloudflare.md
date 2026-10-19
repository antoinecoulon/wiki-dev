# Créer une application Nuxt 4.6 / NuxtHub / Cloudflare

Une app Nuxt full-stack avec base SQL, hébergée gratuitement sur Cloudflare Workers. On développe en local sur un fichier SQLite et on déploie sur D1 sans changer de code.

> Testé le 2026-10-18 avec Nuxt 4.6.2, Nuxt UI 4.12, NuxtHub 0.10.8, Drizzle ORM 0.45 / drizzle-kit 0.31, Wrangler 4.151, TypeScript 5.9, pnpm 10, Node 24.
> Construit au fil du projet wiki-dev : les sections s'ajoutent quand une étape est faite.

## L'idée en 30 secondes

| | En local (`nuxt dev`) | En production (Cloudflare) |
|---|---|---|
| Serveur | Node (Nitro) | Worker Cloudflare (preset `cloudflare_module`) |
| Base | SQLite, fichier `.data/db/sqlite.db` (driver libsql) | **D1** (SQLite managé), binding `DB` |
| Migrations | appliquées automatiquement au démarrage | appliquées par `wrangler d1 migrations apply` |
| Code d'accès | `import { db, schema } from 'hub:db'` | identique |

NuxtHub choisit le driver tout seul : `libsql` en dev, `d1` au build Cloudflare. Le code ne voit que Drizzle.

## 1. Initialiser le projet

```bash
pnpm create nuxt@latest mon-app
cd mon-app
pnpm nuxt module add ui
pnpm nuxt module add hub
```

`module add` ne fait qu'enregistrer le module. Nuxt UI demande en plus :

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";
```

```ts
// nuxt.config.ts
css: ['~/assets/css/main.css'],
```

```vue
<!-- app/app.vue : UApp fournit toasts, tooltips, etc. -->
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

Installer les icônes en local, plutôt que de les charger depuis l'API Iconify (indispensable derrière un proxy) :

```bash
pnpm add -D @iconify-json/lucide
```

> **pnpm 10** bloque les scripts d'installation des dépendances. Autoriser ceux qui sont nécessaires dans `pnpm-workspace.yaml` (`allowBuilds: { esbuild: true }`) ou via `pnpm approve-builds`.

## 2. Lint et typecheck

```bash
pnpm nuxt module add eslint
pnpm add -D typescript@~5.9 vue-tsc
```

```js
// eslint.config.mjs
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```

```ts
// nuxt.config.ts : style de code optionnel
eslint: {
  config: {
    stylistic: { commaDangle: 'never', braceStyle: '1tbs' }
  }
}
```

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"typecheck": "nuxt typecheck"
```

> ⚠️ **Épingler TypeScript en 5.x.** TypeScript 7 (réécrit en Go) n'expose plus l'API JS : `nuxt prepare` plante dans NuxtHub (`rolldown-plugin-dts … useCaseSensitiveFileNames`) et `vue-tsc` ne fonctionne pas.

## 3. Base de données (NuxtHub + Drizzle)

```bash
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

```ts
// nuxt.config.ts
hub: {
  db: 'sqlite'
}
```

### Le schéma

NuxtHub lit `server/db/schema.ts` (ou `server/db/schema/*.ts`) :

```ts
// server/db/schema.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull().default('Sans titre'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
})
```

À chaque modification du schéma, générer la migration :

```bash
pnpm nuxt db generate
```

Les fichiers SQL vont dans `server/db/migrations/sqlite/`, à **commiter**. `nuxt dev` les applique au démarrage.

### L'utiliser dans une route API

```ts
// server/api/pages/index.get.ts
import { db, schema } from 'hub:db'

export default defineEventHandler(() => {
  return db.select().from(schema.pages)
})
```

```ts
// server/api/pages/index.post.ts
import { db, schema } from 'hub:db'

export default defineEventHandler(async () => {
  const [page] = await db.insert(schema.pages).values({}).returning()
  return page
})
```

`hub:db` est un module virtuel généré par NuxtHub : il est typé à partir du schéma après `nuxt prepare` ou `nuxt dev`.

### Commandes utiles

| Commande | Rôle |
|---|---|
| `nuxt db generate` | Migration SQL depuis le schéma |
| `nuxt db migrate` | Appliquer les migrations (local) |
| `nuxt db sql "SELECT …"` | Requête directe sur la base locale |
| `nuxt db squash` | Fusionner les dernières migrations |
| `nuxt db drop <table>` / `drop-all` | Supprimer des tables |

Pour viser D1 avec ces commandes, NuxtHub demande `NUXT_HUB_CLOUDFLARE_ACCOUNT_ID`, `NUXT_HUB_CLOUDFLARE_DATABASE_ID` et `NUXT_HUB_CLOUDFLARE_API_TOKEN`. Plus simple : passer par `wrangler d1 …`.

## 4. Déployer sur Cloudflare Workers

### Configuration

```bash
pnpm add -D wrangler
```

```ts
// nuxt.config.ts
nitro: {
  preset: 'cloudflare_module',
  cloudflare: {
    deployConfig: true, // génère .output/server/wrangler.json
    nodeCompat: true // active le flag nodejs_compat
  }
}
```

```jsonc
// wrangler.jsonc : fusionné dans .output/server/wrangler.json au build
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "mon-app",
  "d1_databases": [
    {
      "binding": "DB", // nom attendu par NuxtHub
      "database_name": "mon-app",
      "database_id": "<id renvoyé par d1 create>"
    }
  ]
}
```

Au build, NuxtHub complète le binding (`migrations_dir: db/migrations/sqlite/`, table `_hub_migrations`) et copie les migrations dans `.output/server/`.

Ajouter `.wrangler` au `.gitignore`.

### S'authentifier auprès de Cloudflare

Deux options, qui s'excluent :

- **OAuth** : `pnpm wrangler login` (ouvre le navigateur).
- **Token** : variable `CLOUDFLARE_API_TOKEN` (modèle « Edit Cloudflare Workers », plus la permission **D1 : Edit**). Si elle est définie, `wrangler login` refuse de s'exécuter : c'est normal, le token suffit.

Vérifier : `pnpm wrangler whoami`.

### Créer la base D1 (une fois)

```bash
pnpm wrangler d1 create mon-app
```

Wrangler propose d'ajouter le binding au `wrangler.jsonc` : répondre avec le nom **`DB`** (sinon NuxtHub ne trouve pas la base), et **non** à « connect to the remote resource » (en dev, NuxtHub utilise de toute façon le SQLite local).

### Déployer

```json
"deploy": "nuxt build && wrangler d1 migrations apply mon-app --remote --config .output/server/wrangler.json && wrangler deploy --config .output/server/wrangler.json"
```

```bash
pnpm run deploy
```

Résultat : l'app est en ligne sur `https://mon-app.<compte>.workers.dev`. Vérifier que `/api/pages` renvoie du JSON.

> ⚠️ `pnpm deploy` (sans `run`) est une commande intégrée de pnpm qui n'a rien à voir avec le script.

## 5. Authentification par mot de passe unique (nuxt-auth-utils)

Pour une app mono-utilisateur : session dans un cookie chiffré, mot de passe hashé (scrypt) en variable d'env, pas de table utilisateur.

### Configuration

```bash
pnpm add nuxt-auth-utils
pnpm add -D @adonisjs/hash # pour générer le hash hors de Nuxt
```

```ts
// nuxt.config.ts
modules: [/* … */, 'nuxt-auth-utils'],
runtimeConfig: {
  adminPasswordHash: '' // surchargé par NUXT_ADMIN_PASSWORD_HASH
}
```

Générer le hash avec la même lib que nuxt-auth-utils (`hashPassword` n'existe que côté serveur Nuxt) :

```js
// scripts/hash-password.mjs → "hash-password": "node scripts/hash-password.mjs"
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'

process.stdout.write(`${await new Hash(new Scrypt({})).make(process.argv[2])}\n`)
```

```bash
# .env (ignoré par git)
NUXT_SESSION_PASSWORD=<openssl rand -hex 32>   # clé de chiffrement du cookie, ≥ 32 caractères
NUXT_ADMIN_PASSWORD_HASH='$scrypt$n=16384,…'   # quotes simples : le hash contient des $
```

### Côté serveur

```ts
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const { password } = await readBody(event)
  if (!await verifyPassword(useRuntimeConfig(event).adminPasswordHash, password)) {
    throw createError({ status: 401, statusText: 'Mot de passe incorrect' })
  }
  await setUserSession(event, { user: { login: 'admin' } })
})
```

```ts
// server/middleware/auth.ts : 401 sur l'API sans session
const PUBLIC_API = ['/api/login', '/api/_auth/'] // /api/_auth/** : endpoints internes du module

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!pathname.startsWith('/api/') || PUBLIC_API.some(path => pathname.startsWith(path))) return
  const session = await getUserSession(event)
  if (!session.user) throw createError({ status: 401, statusText: 'Non authentifié' })
})
```

### Côté client

```ts
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value && to.path !== '/login') return navigateTo('/login')
  if (loggedIn.value && to.path === '/login') return navigateTo('/')
})
```

- Après le login : `await useUserSession().fetch()` puis `navigateTo('/')`.
- Déconnexion : `await useUserSession().clear()` (appelle `DELETE /api/_auth/session`), pas besoin de route.

### En prod (Workers)

Les deux variables passent en secrets, en envoyant la valeur **par l'entrée standard** :

```bash
openssl rand -hex 32 | pnpm wrangler secret put NUXT_SESSION_PASSWORD
pnpm -s hash-password '<mot de passe>' | tr -d '\n' | pnpm wrangler secret put NUXT_ADMIN_PASSWORD_HASH
```

Les secrets survivent aux déploiements. Le hash scrypt par défaut (`n=16384`) tient dans la limite CPU du plan gratuit.

## Arborescence

```
mon-app/
├─ app/
│  ├─ app.vue
│  ├─ assets/css/main.css
│  └─ pages/index.vue
├─ server/
│  ├─ api/pages/index.get.ts
│  └─ db/
│     ├─ schema.ts
│     └─ migrations/sqlite/   # généré, commité
├─ .data/                     # base locale, ignorée par git
├─ eslint.config.mjs
├─ nuxt.config.ts
└─ wrangler.jsonc
```

## Pièges rencontrés

| Symptôme | Cause | Solution |
|---|---|---|
| `nuxt prepare` plante : `rolldown-plugin-dts … useCaseSensitiveFileNames` | TypeScript 7 installé | `pnpm add -D typescript@~5.9` |
| `WARN [Icon] Collection lucide is not found locally` | icônes chargées depuis l'API Iconify | `pnpm add -D @iconify-json/lucide` |
| `wrangler login` : « You are logged in with an API Token » | `CLOUDFLARE_API_TOKEN` défini (ex. `~/.bashrc`) | utiliser le token, pas besoin de login |
| `d1 create` ajoute un 2ᵉ binding au nom de la base (`mon_app`), parfois avec `"remote": true` | nom proposé par défaut par wrangler | garder une seule entrée, binding `DB`, sans `remote` |
| Juste après le 1er déploiement : page affichée mais fichiers `/_nuxt/*.js` en 404, boutons inertes | fichiers statiques pas encore propagés, ou page restée ouverte pendant le déploiement | attendre quelques secondes, recharger avec **Ctrl+Shift+R** |
| `pnpm deploy` ne lance pas le build | commande intégrée de pnpm | `pnpm run deploy` |
| `nuxt dev` : « Another Nuxt dev server is already running » | ancien serveur resté en arrière-plan | `kill <PID>` indiqué dans le message |
| En prod, `/api/_auth/session` en 500, log `Empty password` ; tout mot de passe refusé | `wrangler secret put` lancé sans terminal interactif (ex. `!` dans Claude Code) : secret enregistré **vide**, sans erreur | renvoyer la valeur par stdin : `echo … \| wrangler secret put NOM` |
| Hash tronqué / login toujours refusé en local | `$` du hash interprétés dans `.env` | mettre la valeur entre quotes simples |
| Erreur 500 en prod sans détail | — | `pnpm wrangler tail <worker> --format pretty` pendant qu'on recharge |

## Références

- NuxtHub : <https://hub.nuxt.com/docs/database>
- Nuxt UI : <https://ui.nuxt.com/docs/getting-started/installation/nuxt>
- Nitro, preset Cloudflare : <https://nitro.build/deploy/providers/cloudflare>
- Wrangler, D1 : <https://developers.cloudflare.com/d1/wrangler-commands/>
