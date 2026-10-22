# Créer une application Nuxt 4.6 / NuxtHub (Cloudflare ou Vercel)

Une app Nuxt full-stack avec base SQL, hébergée gratuitement sur Cloudflare Workers (ou sur Vercel + Turso, section 4 bis). On développe en local sur un fichier SQLite et on déploie sur D1 (ou Turso) sans changer de code.

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

Valider une colonne `enum` sans recopier ses valeurs : `schema.pages.section.enumValues` (tableau typé) et `typeof schema.pages.$inferInsert.section` pour le type.

```ts
if (section !== undefined && !schema.pages.section.enumValues.includes(section as never)) {
  throw createError({ status: 400, statusText: 'Section invalide' })
}
```

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

## 4 bis. Alternative : déployer sur Vercel + Turso

Utile si `*.workers.dev` est bloqué (proxy d'entreprise, par exemple). Le code ne change pas : Turso, c'est du SQLite (libSQL), donc le schéma et les migrations Drizzle restent valables.

### Configuration

Retirer le bloc `nitro.preset` / `nitro.cloudflare` : Nitro détecte le preset `vercel` au build. NuxtHub passe sur le driver `libsql` dès que `TURSO_DATABASE_URL` **et** `TURSO_AUTH_TOKEN` sont définies, et applique les migrations pendant le build.

```ts
// nuxt.config.ts
nitro: {
  vercel: { regions: ['dub1'] } // même région que la base (par défaut : iad1, aux USA)
},
hub: { db: 'sqlite' } // inchangé (@libsql/client doit être installé)
```

Ajouter `.vercel` au `.gitignore`.

### Mise en place (une fois)

```bash
# CLI Turso (~/.turso/turso) ; dans un terminal sans navigateur : --headless, puis coller le token
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login --headless   # ouvrir l'URL, copier le token
turso config set token "<token>"
turso db create mon-app --location aws-eu-west-1

pnpm dlx vercel login
pnpm dlx vercel link --yes --project mon-app

# Variables en prod, envoyées par stdin (rien dans l'historique du shell)
turso db show mon-app --url | pnpm dlx vercel env add TURSO_DATABASE_URL production
turso db tokens create mon-app | pnpm dlx vercel env add TURSO_AUTH_TOKEN production
# + NUXT_SESSION_PASSWORD, NUXT_ADMIN_PASSWORD_HASH (section 5) de la même façon
```

### Déployer (à chaque push)

Le dépôt GitHub est connecté au projet Vercel : chaque push sur `main` construit et met en prod, et le statut (✓ / ✗) s'affiche sur le commit. Si l'app est dans un sous-dossier (`src/`), régler le **Root Directory** du projet, sinon le build part de la racine et échoue en 3 s (`nuxt: command not found`) :

```bash
echo '{"rootDirectory":"src"}' > body.json
pnpm dlx vercel api "/v9/projects/<projectId>?teamId=<orgId>" --method PATCH --input body.json   # ids : .vercel/project.json
```

Ensuite, `vercel deploy` lancé depuis `src/` ne marche plus (il cherche `src/src`) : on ne déploie plus qu'en poussant.

Lint et typecheck en GitHub Actions (`.github/workflows/ci.yml`), le build restant fait par Vercel :

```yaml
on: { push: { branches: [main] }, pull_request: {} }
jobs:
  check:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: src } }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm, cache-dependency-path: src/pnpm-lock.yaml }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
```

Vérifier les tables : `turso db shell mon-app ".tables"` (on doit voir `_hub_migrations`).

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

## 6. Éditeur riche (UEditor) et contenu en JSON

`UEditor` (Nuxt UI v4) est un éditeur TipTap prêt à l'emploi. Stocker le JSON TipTap (format natif, sans perte) dans une colonne `text`.

```ts
// server/api/pages/[pageId].get.ts : param nommé explicitement, pas [id]
import type { JSONContent } from '@tiptap/core' // pnpm add @tiptap/core (même version que Nuxt UI)
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'pageId')!
  const page = await db.query.pages.findFirst({ where: eq(schema.pages.id, pageId) })
  if (!page) throw createError({ status: 404, statusText: 'Page introuvable' })
  return { ...page, content: (page.content ? JSON.parse(page.content) : null) as JSONContent | null }
})
```

Côté écriture : `JSON.stringify(content)` dans le `PATCH`. Pour `PATCH`/`DELETE`, `.returning()` vide = 404, sans requête préalable.

```vue
<!-- app/pages/pages/[pageId].vue -->
<script setup lang="ts">
// Sans clé, Nuxt réutilise le composant d'une page à l'autre : les refs gardent l'ancien contenu
definePageMeta({ key: route => route.fullPath })

const route = useRoute('pages-pageId') // route typée
const { data: page, error } = await useFetch(`/api/pages/${route.params.pageId}`)
if (error.value) throw createError({ status: error.value.statusCode, fatal: true }) // page 404
const content = ref(page.value!.content)
</script>

<template>
  <UEditor v-model="content" content-type="json" placeholder="Écris ici…" />
</template>
```

- Sans `UEditorToolbar`, les raccourcis TipTap (Ctrl+B, `#`…) restent actifs.
- `@tiptap/vue-3` (cité dans la doc Nuxt UI) n'est pas importable sans l'installer : pnpm n'expose pas les dépendances transitives.

### Barre d'outils, menu « / », checklists, code coloré

Le slot de `UEditor` expose l'instance `editor`. Les `kind` des items (`mark`, `heading`, `taskList`, `codeBlock`, `undo`…) sont gérés par les handlers intégrés ; un tableau de tableaux crée des groupes séparés.

```bash
pnpm add @tiptap/extension-list @tiptap/extension-code-block-lowlight lowlight highlight.js @tiptap/vue-3
```

```vue
<script setup lang="ts">
import type { EditorSuggestionMenuItem, EditorToolbarItem } from '@nuxt/ui'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { createLowlight } from 'lowlight'
import csharp from 'highlight.js/lib/languages/csharp'
import CodeBlockView from '~/components/CodeBlockView.vue'

const lowlight = createLowlight({ csharp }) // n'importer que les langages utiles
const extensions = [
  // Node view : ajoute un sélecteur de langage au bloc
  CodeBlockLowlight.extend({ addNodeView: () => VueNodeViewRenderer(CodeBlockView) }).configure({ lowlight }),
  TaskList,
  TaskItem.configure({ nested: true })
]
const toolbarItems: EditorToolbarItem[][] = [
  [{ kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' }, { kind: 'taskList', icon: 'i-lucide-list-checks' }]
]
const suggestionItems: EditorSuggestionMenuItem[][] = [
  [{ type: 'label', label: 'Blocs' }, { kind: 'codeBlock', label: 'Bloc de code', icon: 'i-lucide-square-code' }]
]
</script>

<template>
  <!-- codeBlock: false : remplacé par CodeBlockLowlight -->
  <UEditor v-slot="{ editor }" v-model="content" content-type="json" :starter-kit="{ codeBlock: false }" :extensions="extensions">
    <UEditorToolbar :editor="editor" :items="toolbarItems" class="sticky top-0 z-10 bg-default" />
    <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />
  </UEditor>
</template>
```

```vue
<!-- app/components/CodeBlockView.vue -->
<script setup lang="ts">
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const language = computed({
  get: () => props.node.attrs.language || 'auto',
  set: value => props.updateAttributes({ language: value === 'auto' ? null : value }) // null = détection
})
</script>

<template>
  <NodeViewWrapper class="relative">
    <USelect v-model="language" :items="[{ label: 'Auto', value: 'auto' }, { label: 'C#', value: 'csharp' }]" size="xs" class="absolute top-1.5 right-1.5" contenteditable="false" />
    <pre spellcheck="false"><NodeViewContent as="code" /></pre>
  </NodeViewWrapper>
</template>
```

- Ni les checklists (`ul[data-type="taskList"]`) ni les classes `hljs-*` ne sont stylées par `UEditor` : quelques règles CSS dans `main.css` (variables de couleur sous `.dark` pour le mode sombre).
- La détection automatique (langue `null`) est peu fiable sur du code court : proposer le choix explicite.
- ```` ```cs ```` + Entrée crée un bloc dans la langue donnée (alias highlight.js).
- Tab dans le code : `CodeBlockLowlight.configure({ enableTabIndentation: true, tabSize: 4 })` (désactivé par défaut).
- Paires auto-fermantes, Entrée qui garde l'indentation : un plugin `handleTextInput` (`@tiptap/pm/state`) + `addKeyboardShortcuts` dans `.extend()`, actifs seulement si `$from.parent.type.name === 'codeBlock'`. ⚠️ Redéfinir `Enter` ou `Backspace` **remplace** ceux du bloc d'origine (sortie après 3 Entrée…) : garder `const parent = this.parent?.()` et appeler `parent.Enter?.(props)` quand on ne gère pas le cas. Insérer avec `tr.insertText` : `insertContent` analyse la chaîne comme du HTML.

### Sauvegarde automatique

Debounce d'1 s sur `watch([title, content], …, { deep: true })`, une seule requête à la fois (`while (current) await current`), puis :

- `onBeforeRouteLeave` : attendre la sauvegarde en attente avant de changer de page.
- `beforeunload` : `event.preventDefault()` s'il reste une sauvegarde en attente (le navigateur demande confirmation).
- Ne pas rafraîchir l'état local avec la réponse : l'utilisateur a pu continuer à taper pendant la requête.

### Images : coller, glisser, bouton (Vercel Blob privé)

```bash
pnpm add @vercel/blob
pnpm dlx vercel blob create-store mon-app-images --access private --region dub1 --yes  # ajoute BLOB_READ_WRITE_TOKEN au projet
```

Le driver blob de NuxtHub ne gère que les stores publics (il relit les fichiers par leur URL) : pour un store privé, appeler `@vercel/blob` directement.

```ts
// server/api/images.post.ts : 4 Mo max, une requête vers une fonction Vercel est limitée à 4,5 Mo
const file = (await readFormData(event)).get('file') // vérifier File, type (pas de SVG) et taille
const pathname = `images/${crypto.randomUUID()}.png`
await put(pathname, file, { access: 'private', contentType: file.type })
return { src: `/${pathname}` }

// server/routes/images/[name].get.ts : protégée par le middleware d'auth
const result = await get(`images/${name}`, { access: 'private' }).catch(() => null)
if (result?.statusCode !== 200) throw createError({ status: 404 })
setResponseHeaders(event, { 'Content-Type': result.blob.contentType, 'Cache-Control': 'private, max-age=31536000, immutable' })
return result.stream
```

Côté éditeur (`UEditor` inclut déjà l'extension Image) :

- Coller / déposer : `editorProps.handlePaste` / `handleDrop`. Ignorer le contenu venu de l'éditeur (`text/html` contenant `data-pm-slice`, `moved`, type `application/x-prosemirror-slice`) : le navigateur y joint l'image comme fichier, elle serait réuploadée. `@tiptap/extension-file-handler` ne filtre pas ce cas au collage.
- Insertion après l'envoi : `view.dispatch(state.tr.insert(pos, state.schema.nodes.image.create({ src })))`, avec `pos` borné à `doc.content.size` (le document a pu changer).
- Bouton : surcharger le handler `image` (prop `handlers` de `UEditor`, sinon il demande une URL) pour ouvrir un `<input type="file">` caché ; il sert à la fois à la barre d'outils et au menu « / ».
- Erreur de l'API : lire `error.data.statusMessage` (le `statusText` HTTP est vide en HTTP/2).

## 7. Layout avec sidebar (UDashboard*)

Les composants `UDashboard*` de Nuxt UI donnent une sidebar redimensionnable, repliable et en tiroir sur mobile, sans CSS à écrire.

```vue
<!-- app/app.vue -->
<UApp>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</UApp>
```

```vue
<!-- app/layouts/default.vue -->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Clé fixe : n'importe quelle page peut rafraîchir la liste avec refreshNuxtData('pages')
const { data: pages } = await useFetch('/api/pages', { key: 'pages' })
const items = computed<NavigationMenuItem[]>(() => (pages.value ?? []).map(page => ({
  label: page.title, icon: 'i-lucide-file-text', to: `/pages/${page.id}`
})))
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar resizable collapsible>
      <template #header="{ collapsed }">…</template>
      <template #default="{ collapsed }">
        <UNavigationMenu :items="items" :collapsed="collapsed" orientation="vertical" />
      </template>
      <template #footer="{ collapsed }">…</template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>
```

```vue
<!-- chaque page : un panneau, avec la navbar (qui porte le bouton mobile de la sidebar) -->
<UDashboardPanel>
  <template #header>
    <UDashboardNavbar title="Accueil">
      <template #right><!-- actions --></template>
    </UDashboardNavbar>
  </template>
  <template #body>…</template>
</UDashboardPanel>
```

- Page sans layout (ex. `/login`) : `definePageMeta({ layout: false })`.
- Après une création, un renommage ou une suppression : `await refreshNuxtData('pages')`.
- Le lien actif est surligné automatiquement par `UNavigationMenu` (`aria-current="page"`).
- Sidebar repliée : ajouter `tooltip` sur `UNavigationMenu` (sinon aucun nom au survol) ; la barre de défilement (Windows) mange la colonne d'icônes et coupe le surlignage → la masquer en mode replié avec `v-model:collapsed` et `:ui="{ body: collapsed ? '[scrollbar-width:none]' : undefined }"`.

### Recherche Ctrl+K (UDashboardSearch)

Une palette de commandes branchée sur le `UDashboardGroup` : raccourci `meta_k` (Ctrl+K sous Windows/Linux), recherche floue (Fuse) côté client, navigation au clavier.

```vue
<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'

const searchGroups = computed(() => [{
  id: 'pages', // id requis
  label: 'Pages',
  items: (pages.value ?? []).map((page): CommandPaletteItem => ({
    label: page.title, icon: 'i-lucide-file-text', to: `/pages/${page.id}`
  }))
}])
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar v-model:collapsed="collapsed" collapsible>
      <template #default>
        <UDashboardSearchButton label="Rechercher" :collapsed="collapsed" :tooltip="collapsed" />
        …
      </template>
    </UDashboardSidebar>
    <!-- color-mode=false : retire le groupe « thème » ajouté par défaut -->
    <UDashboardSearch :groups="searchGroups" :color-mode="false" placeholder="Rechercher une page…">
      <template #empty>Aucune page trouvée</template>
    </UDashboardSearch>
    <slot />
  </UDashboardGroup>
</template>
```

- Choisir un item avec `to` navigue et ferme la palette.
- Ne pas passer des `NavigationMenuItem` tels quels : erreur de type (`chip`), reconstruire `{ label, icon, to }`.
- Textes en anglais par défaut (pas de `locale` sur `UApp`) : `placeholder` et slot `#empty`.

## 8. Sauvegardes (Turso + Vercel Blob)

Un script Node lancé à la main : dump SQL horodaté de la base, et copie incrémentale des fichiers Blob, vers un dossier `backups/` du repo, ignoré par git.

```jsonc
// package.json : BLOB_READ_WRITE_TOKEN lu depuis .env.local (`vercel env pull`)
"backup": "node --env-file-if-exists=.env.local scripts/backup.mjs"
```

```js
// scripts/backup.mjs (extrait)
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { get, list } from '@vercel/blob'

// Base : la CLI turso (connectée) produit un dump SQL complet
const { stdout: dump } = await promisify(execFile)('turso', ['db', 'shell', 'mon-app', '.dump'], { maxBuffer: 512 * 1024 * 1024 })
if (!dump.trimEnd().endsWith('COMMIT;')) throw new Error('Dump incomplet')

// Blob privé : list() pour l'inventaire (paginé), get() pour le contenu
let cursor
do {
  const page = await list({ prefix: 'images/', cursor })
  for (const blob of page.blobs) {
    const result = await get(blob.pathname, { access: 'private' })
    // écrire Buffer.from(await new Response(result.stream).arrayBuffer())
  }
  cursor = page.cursor
} while (cursor)
```

- Dossier : `join(import.meta.dirname, '../../backups')`, et `backups/` dans le `.gitignore` (contenu privé).
- Dumps horodatés (`mon-app-2026-10-21T20-14.sql`) : l'ordre alphabétique est l'ordre chronologique, on supprime les plus anciens au-delà de N.
- Fichiers Blob aux noms uniques (UUID) jamais réécrits : on ne télécharge que ceux absents du dossier.
- **Restaurer** : `turso db create mon-app-restore`, puis `turso db shell mon-app-restore < dump.sql` ; pointer `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` (section 4 bis) vers la nouvelle base et redéployer.
- Tester une restauration une fois, dans une base jetable (`turso db destroy … --yes` ensuite).

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
| Vercel : URL `mon-app-<suffixe>.vercel.app` au lieu de `mon-app.vercel.app` | sous-domaine déjà pris par un autre compte | renommer le projet ou ajouter un domaine dans les réglages |
| Valeur de `.env` tronquée une fois passée à `vercel env add` | `$` interprétés si on source `.env` avec des valeurs sans quotes | quotes simples dans `.env`, ou transmettre la valeur brute |
| Vercel : déploiements Git en « Error » en 3 s, `nuxt: command not found` | Root Directory du projet à `.` alors que l'app est dans un sous-dossier | Root Directory = `src` (section 4 bis) |
| `.env.example` ignoré par git après `vercel link` ou `vercel blob create-store` | la CLI ajoute `.env*` au `.gitignore` | retirer la ligne (`.env` et `.env.*` suffisent) |
| `vercel logs --since 2h` : « outside the available retention » | plan Hobby : 30 min de logs | reproduire en local (`nuxt dev`) |
| Classe Tailwind sans effet sur un élément de `UEditor` (ex. `pt-10` sur un `pre`) | le thème cible `[&_pre]:…` depuis le parent, plus spécifique | suffixe `!` : `max-sm:pt-10!` |
| Barre d'actions qui déborde sur mobile | libellés des boutons | `:ui="{ label: 'max-sm:hidden' }"` + `aria-label` |
| `turso db create --from-dump dump.sql` : base créée **vide**, sans erreur | — | créer la base vide puis `turso db shell <base> < dump.sql` |

## Références

- NuxtHub : <https://hub.nuxt.com/docs/database>
- Nuxt UI : <https://ui.nuxt.com/docs/getting-started/installation/nuxt>
- Nitro, preset Cloudflare : <https://nitro.build/deploy/providers/cloudflare>
- Wrangler, D1 : <https://developers.cloudflare.com/d1/wrangler-commands/>
- NuxtHub sur Vercel / Turso : <https://hub.nuxt.com/docs/database>
- Nitro, preset Vercel : <https://nitro.build/deploy/providers/vercel>
