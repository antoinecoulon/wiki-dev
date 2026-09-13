# Wiki-dev — Roadmap MVP

> Checklist de développement du MVP. Chaque tâche est atomique et cochable.
> Les blocs de code sont là quand la tâche sort des basiques Nuxt.

---

## 1. Initialisation du projet

### 1.1 Créer le projet Nuxt 4

On commence par scaffolder un projet Nuxt 4 vierge avec le CLI officiel `nuxi`. Il génère la structure de base (nuxt.config, app.vue, package.json). On vérifie que ça tourne, puis on initialise le dépôt git pour avoir un point de retour propre.

- [ ] Initialiser le projet : `pnpm dlx nuxi@latest init wiki-dev`
  - [Doc : Installation](https://nuxt.com/docs/4.x/getting-started/installation)
- [ ] Vérifier que le projet démarre : `pnpm dev`
- [ ] Initialiser git : `git init && git add -A && git commit -m "init: nuxt 4"`

### 1.2 Installer et configurer Nuxt UI

On ajoute Nuxt UI comme module Nuxt. Il s'enregistre dans `nuxt.config.ts` et rend tous ses composants (`UButton`, `UInput`, `UCard`…) disponibles automatiquement sans import. On pose un bouton de test dans `app.vue` pour valider que Tailwind + les composants fonctionnent.

- [ ] Installer : `pnpm add @nuxt/ui`
- [ ] Ajouter le module dans `nuxt.config.ts` :
  ```ts
  export default defineNuxtConfig({
    modules: ['@nuxt/ui'],
  })
  ```
  - [Doc : Nuxt UI — Getting Started](https://ui.nuxt.com/getting-started/installation)
- [ ] Vérifier que les composants Nuxt UI s'affichent (tester un `<UButton>` dans `app.vue`)

### 1.3 Installer et configurer NuxtHub

On ajoute NuxtHub comme module et on active la feature `database`. En dev local, NuxtHub émule une base SQLite D1 via `wrangler` dans un dossier `.data/hub` — on n'a pas besoin de compte Cloudflare pour développer. On vérifie juste que le dossier apparaît au lancement du dev server.

- [ ] Installer : `pnpm add @nuxthub/core`
- [ ] Ajouter le module et activer la database dans `nuxt.config.ts` :
  ```ts
  export default defineNuxtConfig({
    modules: ['@nuxt/ui', '@nuxthub/core'],
    hub: {
      database: true,
    },
  })
  ```
  - [Doc : NuxtHub Installation](https://hub.nuxt.com/docs/getting-started/installation)
- [ ] Vérifier que `pnpm dev` lance bien l'émulation locale D1 (un dossier `.data/hub` doit apparaître)

### 1.4 Installer et configurer Drizzle

On installe Drizzle ORM (accès typé à la base) et drizzle-kit (outil CLI pour les migrations). On crée le schéma de la table `pages` qui décrit le modèle de données de l'app : chaque page a un ID, un parent optionnel (pour l'arborescence), un titre, du contenu JSON Tiptap, un texte brut extrait pour la recherche, et une position pour l'ordre d'affichage. On crée ensuite un utilitaire `useDB()` qui instancie Drizzle par-dessus la connexion D1 fournie par NuxtHub — c'est ce qu'on appellera dans chaque server route. Enfin, on génère et applique la première migration SQL.

- [ ] Installer : `pnpm add drizzle-orm && pnpm add -D drizzle-kit`
- [ ] Créer `server/database/schema.ts` avec le schéma pages :
  ```ts
  import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

  export const pages = sqliteTable('pages', {
    id: text('id').primaryKey(),
    parentId: text('parent_id').references(() => pages.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Sans titre'),
    content: text('content'),
    contentText: text('content_text'),
    position: integer('position').notNull().default(0),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  })
  ```
- [ ] Créer `server/utils/db.ts` pour exposer l'instance Drizzle :
  ```ts
  import { drizzle } from 'drizzle-orm/d1'
  import * as schema from '../database/schema'

  export { schema }

  export function useDB() {
    return drizzle(hubDatabase(), { schema })
  }
  ```
  - [Doc : NuxtHub + Drizzle](https://hub.nuxt.com/docs/recipes/drizzle)
- [ ] Créer `drizzle.config.ts` :
  ```ts
  import { defineConfig } from 'drizzle-kit'

  export default defineConfig({
    dialect: 'sqlite',
    schema: './server/database/schema.ts',
    out: './server/database/migrations',
  })
  ```
- [ ] Générer la première migration : `pnpm drizzle-kit generate`
- [ ] Appliquer la migration sur la base locale : `pnpm drizzle-kit migrate`
  - [Doc : Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)

### 1.5 Installer nuxt-auth-utils

On ajoute le module d'authentification. Il a besoin d'un secret de session (une clé aléatoire longue) stocké en variable d'environnement pour chiffrer les cookies de session. On le génère avec la commande intégrée et on le place dans `.env` (fichier non commité). Le module expose des fonctions serveur (`setUserSession`, `getUserSession`, `clearUserSession`) et un composable client (`useUserSession`).

- [ ] Installer : `pnpm add nuxt-auth-utils`
- [ ] Ajouter le module dans `nuxt.config.ts` :
  ```ts
  modules: ['@nuxt/ui', '@nuxthub/core', 'nuxt-auth-utils'],
  ```
- [ ] Générer le secret de session : `npx nuxt-auth-utils --generate-session-password` et l'ajouter dans `.env` :
  ```
  NUXT_SESSION_PASSWORD=<la_clé_générée>
  ```
  - [Doc : nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- [ ] Commit : `git add -A && git commit -m "setup: nuxtui, nuxthub, drizzle, auth"`

---

## 2. Authentification

### 2.1 Page de login

On crée une page dédiée au login. Comme l'app est mono-utilisateur, le formulaire ne contient qu'un seul champ : le mot de passe. On utilise les composants Nuxt UI pour avoir un rendu propre sans effort. La page doit être visuellement simple — un `UCard` centré au milieu de l'écran avec le champ et un bouton "Connexion".

- [ ] Créer `app/pages/login.vue`
- [ ] Ajouter un formulaire avec un champ mot de passe (pas de champ user — mono-utilisateur)
- [ ] Utiliser les composants Nuxt UI : `<UCard>`, `<UFormField>`, `<UInput>`, `<UButton>`
- [ ] Centrer le formulaire verticalement et horizontalement dans la page

### 2.2 Route API login

On crée la route serveur qui reçoit le mot de passe, le compare avec le hash stocké en variable d'environnement, et crée une session si c'est le bon. Le hash du mot de passe admin est stocké dans `NUXT_ADMIN_PASSWORD_HASH` (jamais le mot de passe en clair). On utilise `setUserSession` de nuxt-auth-utils pour créer un cookie de session sécurisé et scellé. Si le mot de passe est faux, on retourne une 401.

- [ ] Créer `server/api/auth/login.post.ts`
- [ ] Lire le mot de passe envoyé dans le body
- [ ] Comparer avec un hash stocké en variable d'environnement (`NUXT_ADMIN_PASSWORD_HASH`)
- [ ] Hasher le mot de passe côté serveur pour comparer :
  ```ts
  import { setUserSession } from '#imports'

  export default defineEventHandler(async (event) => {
    const { password } = await readBody(event)
    // Comparer le hash du password reçu avec NUXT_ADMIN_PASSWORD_HASH
    // Si match :
    await setUserSession(event, { user: { name: 'admin' } })
    return { success: true }
    // Sinon : throw createError({ statusCode: 401, message: 'Mot de passe incorrect' })
  })
  ```
- [ ] Ajouter `NUXT_ADMIN_PASSWORD_HASH` dans `.env` (générer le hash avec un script one-shot ou en ligne de commande)

### 2.3 Route API logout

On crée une route qui détruit la session. `clearUserSession` supprime le cookie de session côté serveur. Côté client, on appellera cette route puis on redirigera vers `/login`.

- [ ] Créer `server/api/auth/logout.post.ts`
- [ ] Appeler `clearUserSession(event)` et retourner `{ success: true }`

### 2.4 Middleware de protection des routes API

On crée un middleware serveur (Nitro) qui intercepte chaque requête entrante. Si la requête cible `/api/` et que ce n'est pas la route de login, on vérifie que l'utilisateur a une session valide. Sans session → 401. C'est la protection "security by design" : toutes les routes API sont protégées par défaut, on n'a pas besoin d'y penser route par route.

- [ ] Créer `server/middleware/auth.ts`
- [ ] Vérifier la session sur chaque requête `/api/` sauf `/api/auth/login` :
  ```ts
  export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)
    if (!url.pathname.startsWith('/api/') || url.pathname.startsWith('/api/auth/')) return
    const session = await getUserSession(event)
    if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })
  })
  ```

### 2.5 Middleware de protection côté client

On crée un middleware de route Nuxt global (suffixe `.global.ts`) qui s'exécute à chaque navigation côté client. Il utilise le composable `useUserSession()` fourni par nuxt-auth-utils pour vérifier si l'utilisateur est connecté. Si non → redirection vers `/login`. Si oui et qu'on est sur `/login` → redirection vers `/`. Ça empêche l'accès à l'app sans connexion et évite de rester sur la page login quand on est déjà authentifié.

- [ ] Créer `app/middleware/auth.global.ts`
- [ ] Rediriger vers `/login` si pas de session active (sauf si déjà sur `/login`) :
  ```ts
  export default defineNuxtRouteMiddleware((to) => {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value && to.path !== '/login') return navigateTo('/login')
    if (loggedIn.value && to.path === '/login') return navigateTo('/')
  })
  ```
  - [Doc : nuxt-auth-utils — Vue composables](https://github.com/atinux/nuxt-auth-utils#vue-composables)

### 2.6 Vérification manuelle

On teste le parcours complet d'authentification pour s'assurer que la protection fonctionne dans les deux sens : serveur (API) et client (navigation). On vérifie qu'un utilisateur non connecté ne peut ni accéder aux pages ni appeler les API.

- [ ] Lancer `pnpm dev`
- [ ] Vérifier que toute navigation redirige vers `/login`
- [ ] Se connecter avec le mot de passe → vérifier la redirection vers `/`
- [ ] Vérifier qu'un appel API sans session retourne 401
- [ ] Commit

---

## 3. API CRUD pages

### 3.1 Utilitaire — Génération d'ID

On crée un utilitaire pour générer des identifiants uniques courts pour les pages. On utilise `nanoid` qui produit des IDs URL-safe de 12 caractères (ex: `V1StGXR8_Z5j`). Ces IDs serviront de clé primaire dans la table `pages` et apparaîtront dans les URLs. On place la fonction dans `server/utils/` pour qu'elle soit auto-importée dans toutes les server routes.

- [ ] Installer nanoid : `pnpm add nanoid`
- [ ] Créer `server/utils/id.ts` :
  ```ts
  import { nanoid } from 'nanoid'
  export const generateId = () => nanoid(12)
  ```

### 3.2 Utilitaire — Extraction de texte brut depuis JSON Tiptap

On crée une fonction qui parcourt récursivement l'arbre JSON produit par Tiptap pour en extraire tout le texte brut. Tiptap structure le contenu en nœuds imbriqués (doc → paragraphe → texte, doc → heading → texte, etc.). On descend récursivement dans les `content` de chaque nœud et on concatène les `text`. Le résultat est une chaîne de texte plate, nettoyée des espaces multiples, qu'on stockera dans `content_text` pour la recherche.

- [ ] Créer `server/utils/extract-text.ts`
- [ ] Parcourir récursivement les nœuds Tiptap pour extraire le texte :
  ```ts
  interface TiptapNode {
    type: string
    text?: string
    content?: TiptapNode[]
  }

  export function extractText(doc: TiptapNode): string {
    if (doc.text) return doc.text
    if (!doc.content) return ''
    return doc.content.map(extractText).join(' ').replace(/\s+/g, ' ').trim()
  }
  ```

### 3.3 POST /api/pages — Créer une page

On crée la route de création d'une page. Elle reçoit un `parentId` optionnel (null = page racine) et un `title` optionnel. Pour la position, on récupère la position maximale parmi les pages sœurs (même parent) et on ajoute 1, de sorte que la nouvelle page apparaisse en dernier. On génère un nanoid, on insère la ligne avec Drizzle, et on retourne la page créée pour que le client puisse naviguer vers elle.

- [ ] Créer `server/api/pages/index.post.ts`
- [ ] Lire `{ parentId, title }` depuis le body
- [ ] Calculer la position : `SELECT MAX(position) FROM pages WHERE parent_id = ?` + 1
- [ ] Insérer la page avec `useDB().insert(schema.pages).values({ ... })`
- [ ] Retourner la page créée

### 3.4 GET /api/pages — Liste complète (arbre)

On crée la route qui retourne toutes les pages, mais sans leur contenu (le JSON Tiptap peut être lourd). On ne sélectionne que `id`, `parentId`, `title` et `position` — le strict nécessaire pour construire l'arbre de navigation côté client. On trie par `position` pour que l'ordre soit respecté. La construction de l'arbre (parent → enfants) se fera côté client dans le composable `usePages`, pas ici.

- [ ] Créer `server/api/pages/index.get.ts`
- [ ] Récupérer toutes les pages (sans le champ `content` pour alléger) :
  ```ts
  const allPages = await useDB()
    .select({
      id: schema.pages.id,
      parentId: schema.pages.parentId,
      title: schema.pages.title,
      position: schema.pages.position,
    })
    .from(schema.pages)
    .orderBy(schema.pages.position)
  ```
- [ ] Retourner la liste plate — la construction de l'arbre se fera côté client

### 3.5 GET /api/pages/:id — Détail d'une page

On crée la route qui retourne une page individuelle avec tout son contenu. C'est cette route qui sera appelée quand on ouvre une page dans l'éditeur — on a besoin du JSON Tiptap complet. Si l'ID ne correspond à aucune page, on retourne une erreur 404.

- [ ] Créer `server/api/pages/[id].get.ts`
- [ ] Récupérer la page par ID (tous les champs, y compris `content`)
- [ ] Retourner 404 si inexistante

### 3.6 PUT /api/pages/:id — Modifier une page

On crée la route de modification. Elle accepte n'importe quelle combinaison de champs modifiables : `title`, `content`, `parentId`, `position`. Si du `content` est envoyé (l'utilisateur a édité la page), on extrait le texte brut avec `extractText()` et on met à jour `contentText` en même temps. On met aussi à jour `updatedAt` avec le timestamp courant. Ce design "partial update" permet d'utiliser la même route pour renommer une page depuis la sidebar, sauvegarder le contenu depuis l'éditeur, ou déplacer une page dans l'arbre.

- [ ] Créer `server/api/pages/[id].put.ts`
- [ ] Lire les champs modifiables depuis le body : `{ title?, content?, parentId?, position? }`
- [ ] Si `content` est fourni, extraire le texte brut via `extractText()` et mettre à jour `contentText`
- [ ] Mettre à jour `updatedAt` à `new Date().toISOString()`
- [ ] Appliquer l'update avec Drizzle :
  ```ts
  await useDB()
    .update(schema.pages)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id))
  ```
- [ ] Retourner la page mise à jour

### 3.7 DELETE /api/pages/:id — Supprimer une page

On crée la route de suppression. Grâce au `ON DELETE CASCADE` défini dans le schéma, supprimer une page supprime automatiquement toutes ses sous-pages en base — pas besoin de logique récursive côté applicatif. On supprime par ID et on retourne un accusé de réception.

- [ ] Créer `server/api/pages/[id].delete.ts`
- [ ] Supprimer la page par ID (le `ON DELETE CASCADE` supprime les enfants)
- [ ] Retourner `{ success: true }`

### 3.8 Vérification manuelle

On teste chaque route API individuellement avant de brancher le frontend. On peut utiliser le panneau DevTools de NuxtHub (accessible en dev via `/__nuxt_devtools`), `curl`, ou un client HTTP comme Thunder Client / Postman. On s'assure que le cycle complet fonctionne : créer → lire → modifier → supprimer, et que la cascade parent-enfants se comporte correctement.

- [ ] Tester chaque route avec le NuxtHub DevTools ou `curl` / un client HTTP
- [ ] Vérifier la création, lecture, modification, suppression
- [ ] Vérifier que la suppression d'un parent supprime les enfants
- [ ] Vérifier que `contentText` est bien extrait à la sauvegarde
- [ ] Commit

---

## 4. Composable usePages (état client)

### 4.1 Créer le composable usePages

On crée le composable qui servira de couche d'accès aux données côté client. Il centralise tout ce qui concerne les pages : le chargement de l'arbre, le CRUD, et la page courante. On commence par définir le type `PageTreeItem` qui décrit une page dans l'arbre de navigation — c'est un miroir allégé du schéma serveur (sans `content`) avec un tableau `children` pour l'imbrication.

- [ ] Créer `app/composables/usePages.ts`
- [ ] Définir le type `Page` (miroir du schéma, sans `content` pour l'arbre) :
  ```ts
  interface PageTreeItem {
    id: string
    parentId: string | null
    title: string
    position: number
    children: PageTreeItem[]
  }
  ```

### 4.2 Charger l'arbre

On utilise `useFetch` pour appeler `GET /api/pages` qui retourne la liste plate de toutes les pages. Ensuite, la fonction `buildTree` transforme cette liste en arbre imbriqué : elle crée une `Map` indexée par ID, puis pour chaque page, elle la rattache au tableau `children` de son parent (ou à la racine si `parentId` est null). Le résultat est un tableau de pages racines, chacune contenant récursivement ses enfants. C'est cette structure qui alimentera la sidebar.

- [ ] Utiliser `useFetch('/api/pages')` pour charger la liste plate
- [ ] Écrire une fonction `buildTree(pages)` qui transforme la liste plate en arbre imbriqué :
  ```ts
  function buildTree(pages: PageTreeItem[]): PageTreeItem[] {
    const map = new Map<string, PageTreeItem>()
    const roots: PageTreeItem[] = []
    pages.forEach(p => map.set(p.id, { ...p, children: [] }))
    map.forEach(p => {
      if (p.parentId && map.has(p.parentId)) {
        map.get(p.parentId)!.children.push(p)
      } else {
        roots.push(p)
      }
    })
    return roots
  }
  ```

### 4.3 Méthodes CRUD

On expose trois méthodes qui encapsulent les appels API et rafraîchissent l'arbre automatiquement après chaque opération. `createPage` envoie un POST et redirige vers la nouvelle page. `deletePage` envoie un DELETE et redirige vers l'accueil si la page supprimée était celle affichée. `updatePage` envoie un PUT pour les modifications (renommage, déplacement). Chaque méthode appelle `refresh()` sur le `useFetch` de l'arbre pour que la sidebar reflète le changement.

- [ ] `createPage(parentId?: string)` → POST /api/pages → refresh arbre
- [ ] `deletePage(id: string)` → DELETE /api/pages/:id → refresh arbre
- [ ] `updatePage(id, data)` → PUT /api/pages/:id (pour renommer depuis la sidebar)

### 4.4 Page courante

On expose un `currentPageId` réactif qui est dérivé de la route courante (le premier segment de `route.params.slug`). Et un `currentPage` qui est un `useFetch` vers `GET /api/pages/${id}` — il charge le contenu complet de la page ouverte, y compris le JSON Tiptap. Quand on navigue vers une autre page, le `watch` sur l'ID déclenche un nouveau fetch et l'éditeur se met à jour.

- [ ] Exposer un `currentPageId` réactif (lié à la route)
- [ ] Exposer un `currentPage` qui charge le contenu complet via `useFetch('/api/pages/${id}')`

---

## 5. Layout et navigation

### 5.1 Layout par défaut

On crée le layout principal de l'application. Il structure l'écran en deux zones : une sidebar fixe à gauche (~260px) qui contient la navigation, et une zone de contenu à droite qui occupe le reste de la largeur. On utilise flexbox ou CSS grid avec Tailwind. Le `<slot />` dans la zone de contenu recevra le contenu de chaque page Nuxt.

- [ ] Créer `app/layouts/default.vue`
- [ ] Structure : sidebar à gauche (fixe, ~260px) + zone de contenu à droite
- [ ] Utiliser les classes Tailwind / composants Nuxt UI pour le layout
  - [Doc : Nuxt UI Layout](https://ui.nuxt.com/)

### 5.2 Composant Sidebar

On crée le composant sidebar qui contient trois zones verticales. L'en-tête affiche le nom de l'app et un bouton pour créer une nouvelle page racine. Le corps contient le composant `PageTree` qui rend l'arborescence. Le pied contient un bouton de déconnexion. On utilise `flex flex-col h-full` pour que le corps prenne tout l'espace disponible avec `flex-1 overflow-y-auto`.

- [ ] Créer `app/components/navigation/Sidebar.vue`
- [ ] En-tête : titre "Wiki-dev" + bouton "Nouvelle page" (`<UButton icon="i-lucide-plus">`)
- [ ] Corps : composant `PageTree` qui affiche l'arbre
- [ ] Pied : bouton de déconnexion

### 5.3 Composant PageTree

On crée le composant qui reçoit les pages racines depuis `usePages()` et les rend sous forme de liste. Pour chaque page racine, il affiche un `PageTreeItem`. C'est un composant simple de "distribution" — la logique récursive d'affichage des enfants est dans `PageTreeItem` lui-même.

- [ ] Créer `app/components/navigation/PageTree.vue`
- [ ] Recevoir en props la liste des pages racines depuis `usePages()`
- [ ] Rendre récursivement des `PageTreeItem` pour chaque page

### 5.4 Composant PageTreeItem

On crée le composant récursif qui représente une page dans l'arbre. Il affiche le titre (cliquable pour naviguer), un chevron pour déplier/replier les enfants (si la page en a), et un indicateur visuel quand c'est la page active. La récursion se fait en rendant des `PageTreeItem` pour chaque enfant quand le nœud est déplié. L'indentation est gérée par une prop `depth` qui augmente de 1 à chaque niveau et se traduit en `padding-left`.

- [ ] Créer `app/components/navigation/PageTreeItem.vue`
- [ ] Afficher le titre de la page, cliquable → `navigateTo(`/${page.id}`)`
- [ ] Chevron d'expansion si la page a des enfants (toggle local `isExpanded`)
- [ ] Indicateur visuel de la page active (basé sur la route courante)
- [ ] Rendu récursif des enfants quand `isExpanded` est true
- [ ] Indentation progressive (passer un `depth` en prop, `padding-left: depth * 16px`)

### 5.5 Bouton nouvelle page

On câble le bouton "Nouvelle page" de l'en-tête de la sidebar. Au clic, il appelle `createPage()` sans `parentId` (ce qui crée une page racine). La page est créée avec le titre par défaut "Sans titre" et on navigue automatiquement vers elle pour que l'utilisateur puisse commencer à écrire immédiatement.

- [ ] Au clic : appeler `usePages().createPage()` (page racine)
- [ ] La page est créée avec le titre "Sans titre"
- [ ] Naviguer automatiquement vers la nouvelle page

### 5.6 Bouton nouvelle sous-page

On ajoute un bouton "+" qui apparaît au survol de chaque `PageTreeItem`. Il permet de créer une sous-page rattachée à la page survolée. On passe le `parentId` à `createPage` pour que la nouvelle page soit insérée comme enfant. On navigue vers la sous-page créée et on déplie automatiquement le parent dans l'arbre si il ne l'était pas.

- [ ] Ajouter un bouton "+" au survol de chaque `PageTreeItem`
- [ ] Au clic : appeler `usePages().createPage(parentId)`
- [ ] Naviguer vers la nouvelle sous-page

### 5.7 Supprimer une page

On ajoute un menu contextuel sur chaque `PageTreeItem` (bouton `...` ou clic droit) avec une option "Supprimer". On utilise le composant `<UDropdownMenu>` de Nuxt UI. Avant de supprimer, on affiche une confirmation (modale ou toast) car la suppression est cascade — elle supprime aussi les sous-pages. Après suppression, si la page supprimée était la page active, on redirige vers `/`.

- [ ] Ajouter une action "Supprimer" dans un menu contextuel sur chaque `PageTreeItem` (clic droit ou bouton `...`)
- [ ] Utiliser `<UDropdownMenu>` de Nuxt UI
- [ ] Demander confirmation avant suppression (modale ou toast de confirmation)
- [ ] Après suppression, naviguer vers `/` si la page supprimée était la page active

### 5.8 Vérification manuelle

On teste l'ensemble de la navigation : affichage de l'arbre avec plusieurs niveaux de profondeur, création de pages racines et de sous-pages, expansion/collapse des nœuds, suppression avec cascade, et navigation correcte après chaque opération.

- [ ] Vérifier l'affichage de l'arbre avec plusieurs niveaux
- [ ] Vérifier la création de pages racines et sous-pages
- [ ] Vérifier la suppression et la navigation post-suppression
- [ ] Commit

---

## 6. Éditeur de pages

### 6.1 Installer Tiptap

On installe les trois packages nécessaires : `@tiptap/vue-3` (les composants et composables Vue), `@tiptap/pm` (ProseMirror, le moteur sous-jacent), et `@tiptap/starter-kit` (un bundle d'extensions de base qui inclut paragraphes, titres, listes, gras, italique, code, citations, etc.). C'est tout ce qu'il faut pour un éditeur riche fonctionnel.

- [ ] Installer les packages :
  ```bash
  pnpm add @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit
  ```
  - [Doc : Tiptap — Installation Nuxt](https://tiptap.dev/docs/editor/getting-started/install/nuxt)

### 6.2 Composant TiptapEditor

On crée le composant central de l'éditeur. Il utilise le composable `useEditor` de Tiptap pour instancier un éditeur avec le `StarterKit`. Le contenu est reçu en prop (JSON Tiptap) et chaque modification émet un événement `update:content` avec le nouveau JSON. Le composant `<EditorContent>` rend la zone d'édition. Un watcher surveille les changements de la prop `content` pour mettre à jour l'éditeur quand on change de page — la comparaison JSON évite les boucles infinies (l'éditeur qui émet un update qui déclenche le watcher qui re-set le contenu…).

- [ ] Créer `app/components/editor/TiptapEditor.vue`
- [ ] Initialiser l'éditeur avec `useEditor()` de `@tiptap/vue-3` :
  ```ts
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'

  const props = defineProps<{ content: object | null }>()
  const emit = defineEmits<{ 'update:content': [value: object] }>()

  const editor = useEditor({
    extensions: [StarterKit],
    content: props.content,
    onUpdate: ({ editor }) => {
      emit('update:content', editor.getJSON())
    },
  })
  ```
- [ ] Rendre `<EditorContent :editor="editor" />` dans le template
- [ ] Watcher pour mettre à jour le contenu quand on change de page :
  ```ts
  watch(() => props.content, (val) => {
    if (editor.value && JSON.stringify(editor.value.getJSON()) !== JSON.stringify(val)) {
      editor.value.commands.setContent(val || { type: 'doc', content: [] })
    }
  })
  ```

### 6.3 Toolbar de formatage

On crée la barre d'outils qui s'affiche au-dessus de l'éditeur. Elle reçoit l'instance `editor` en prop et propose un bouton par action de formatage. Chaque bouton appelle une commande Tiptap via la chaîne `editor.chain().focus().toggleXxx().run()`. Le `focus()` est important : il remet le curseur dans l'éditeur après le clic sur le bouton (sinon l'éditeur perd le focus). On utilise `editor.isActive('bold')` pour changer la variante du bouton (solid si actif, ghost sinon) et donner un feedback visuel.

- [ ] Créer `app/components/editor/EditorToolbar.vue`
- [ ] Recevoir l'instance `editor` en prop
- [ ] Boutons de formatage avec `<UButton>` :
  - Gras (`editor.chain().focus().toggleBold().run()`)
  - Italique (`toggleItalic`)
  - Barré (`toggleStrike`)
  - Code inline (`toggleCode`)
  - Séparateur
  - Titre H1, H2, H3 (`toggleHeading({ level })`)
  - Séparateur
  - Liste à puces (`toggleBulletList`)
  - Liste numérotée (`toggleOrderedList`)
  - Bloc de code (`toggleCodeBlock`)
  - Citation (`toggleBlockquote`)
  - [Doc : Tiptap — StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
- [ ] Mettre en surbrillance le bouton actif : `editor.isActive('bold')` → variante `solid` vs `ghost`

### 6.4 Titre de page éditable

On affiche un grand champ de texte au-dessus de l'éditeur pour le titre de la page. C'est un `<input>` stylé en gros (text-3xl, font-bold, pas de bordure) qui ressemble à un titre Notion. Quand l'utilisateur modifie le titre et quitte le champ (blur) ou après un debounce de 300ms, on appelle `updatePage(id, { title })` pour persister le changement. Le titre mis à jour se reflète dans la sidebar après le refresh de l'arbre.

- [ ] Dans la page `[...slug].vue`, afficher un `<input>` ou `<UInput>` au-dessus de l'éditeur pour le titre
- [ ] Au blur ou debounce (300ms) : appeler `updatePage(id, { title })` pour persister
- [ ] Le titre se reflète dans la sidebar en temps réel (le refresh de l'arbre le met à jour)

### 6.5 Page dynamique [...slug].vue

On crée la page catch-all qui affiche l'éditeur pour n'importe quelle page. Le `[...slug]` dans le nom de fichier capture tout segment d'URL après `/`. On extrait l'ID de la page depuis le premier segment du slug, on charge la page complète via `useFetch` (avec le JSON Tiptap), et on affiche la toolbar + l'éditeur. Cette page est le cœur de l'application — c'est là qu'on passe le plus de temps.

- [ ] Créer `app/pages/[...slug].vue`
- [ ] Extraire l'ID depuis la route : `const id = route.params.slug[0]` (ou adapter selon le format de route choisi)
- [ ] Charger la page complète via `useFetch(`/api/pages/${id}`)`
- [ ] Afficher le `TiptapEditor` avec le contenu chargé
- [ ] Afficher la `EditorToolbar` au-dessus

### 6.6 Sauvegarde automatique

On met en place une sauvegarde automatique pour éviter à l'utilisateur de penser à sauvegarder. À chaque frappe dans l'éditeur (événement `update:content`), on déclenche un timer de 1 seconde via `useDebounceFn` de VueUse. Si l'utilisateur continue de taper, le timer se remet à zéro. Quand il arrête pendant 1 seconde, le contenu est envoyé au serveur via PUT. On affiche un petit indicateur de statut ("Enregistrement..." pendant l'appel, "Enregistré" quand c'est fait) pour rassurer l'utilisateur.

- [ ] Dans `[...slug].vue` ou un composable `useEditor.ts`
- [ ] Debounce la sauvegarde à 1 seconde après la dernière frappe :
  ```ts
  import { useDebounceFn } from '@vueuse/core'

  const save = useDebounceFn(async (content: object) => {
    await $fetch(`/api/pages/${id}`, {
      method: 'PUT',
      body: { content },
    })
  }, 1000)
  ```
  - Installer VueUse si besoin : `pnpm add @vueuse/core`
  - [Doc : VueUse — useDebounceFn](https://vueuse.org/shared/useDebounceFn/)
- [ ] Indicateur de statut de sauvegarde : "Enregistré" / "Enregistrement..." (petit texte discret)

### 6.7 Page d'accueil

On crée la page d'accueil qui s'affiche quand on arrive sur `/` (aucune page sélectionnée). Si l'utilisateur n'a encore aucune page, on affiche un message d'accueil avec un call-to-action pour créer sa première page. Sinon, on peut afficher une liste des pages récemment modifiées (triées par `updatedAt` descendant) pour un accès rapide.

- [ ] Créer `app/pages/index.vue`
- [ ] Afficher un message d'accueil si aucune page n'existe ("Créez votre première page")
- [ ] Ou afficher la liste des pages récentes (dernières modifiées)

### 6.8 Vérification manuelle

On teste le parcours complet de l'éditeur : créer une page, écrire du contenu avec différents formatages, rafraîchir la page pour vérifier que tout a été persisté, changer de page et revenir pour vérifier que le contenu se recharge correctement. On vérifie aussi que la sauvegarde auto fonctionne en regardant le timing (modifier, attendre 1s, rafraîchir).

- [ ] Créer une page, écrire du contenu, rafraîchir → le contenu persiste
- [ ] Tester chaque bouton de la toolbar
- [ ] Vérifier la sauvegarde auto (modifier, attendre 1s, rafraîchir)
- [ ] Vérifier le changement de page (le contenu se met à jour correctement)
- [ ] Commit

---

## 7. Recherche par titre

### 7.1 Route API recherche

On crée une route GET dédiée à la recherche. Elle lit le query parameter `q`, et cherche dans les titres de pages avec un `LIKE %q%` (recherche partielle, insensible à la position). On ne retourne que l'ID et le titre (pas le contenu) pour que la réponse soit légère, et on limite à 20 résultats. C'est une recherche simple qui suffira pour le MVP — la recherche full-text dans le contenu viendra en V1.

- [ ] Créer `server/api/pages/search.get.ts`
- [ ] Lire le query param `q`
- [ ] Rechercher dans les titres avec `LIKE` :
  ```ts
  const results = await useDB()
    .select({ id: schema.pages.id, title: schema.pages.title })
    .from(schema.pages)
    .where(like(schema.pages.title, `%${q}%`))
    .limit(20)
  ```

### 7.2 Composant de recherche

On crée une modale de recherche inspirée du Ctrl+K de VS Code / Notion. Le composant `<UCommandPalette>` de Nuxt UI est idéal : il fournit un champ de recherche, une liste de résultats filtrés, et la navigation clavier (flèches + Entrée). On branche la recherche sur l'API avec un debounce de 300ms pour ne pas spammer le serveur à chaque caractère. Au clic ou Entrée sur un résultat, on navigue vers la page correspondante et on ferme la modale.

- [ ] Créer `app/components/navigation/SearchDialog.vue`
- [ ] Utiliser `<UModal>` ou `<UCommandPalette>` de Nuxt UI
  - [Doc : Nuxt UI — CommandPalette](https://ui.nuxt.com/components/command-palette)
- [ ] Ouvrir avec un raccourci clavier `Ctrl+K` (utiliser `useEventListener` ou `defineShortcuts` de Nuxt UI)
- [ ] Champ de recherche avec debounce (300ms) qui appelle `/api/pages/search?q=...`
- [ ] Afficher les résultats en liste
- [ ] Au clic sur un résultat → `navigateTo(`/${page.id}`)`

### 7.3 Intégration dans la sidebar

On ajoute un point d'entrée visible vers la recherche dans la sidebar, en plus du raccourci clavier. Ça peut être un bouton avec une icône loupe et le hint "Ctrl+K", ou un faux champ de recherche qui ouvre la modale au clic. On le place en haut de la sidebar, au-dessus de l'arbre, pour qu'il soit toujours accessible.

- [ ] Ajouter un bouton ou champ de recherche en haut de la sidebar
- [ ] Au clic ou focus → ouvrir le `SearchDialog`

### 7.4 Vérification manuelle

On teste la recherche de bout en bout : créer plusieurs pages avec des titres variés, ouvrir la recherche avec Ctrl+K, taper un mot partiel, vérifier que les résultats se mettent à jour, cliquer sur un résultat et vérifier la navigation. On vérifie aussi le cas vide (aucun résultat) et le cas sans terme de recherche.

- [ ] Créer plusieurs pages avec des titres différents
- [ ] Vérifier que la recherche filtre correctement
- [ ] Vérifier la navigation vers le résultat sélectionné
- [ ] Vérifier le raccourci `Ctrl+K`
- [ ] Commit

---

## 8. Déploiement

### 8.1 Comptes et liaison

On crée les comptes nécessaires au déploiement. D'abord un compte NuxtHub (login via GitHub, gratuit), puis on lie un compte Cloudflare (gratuit aussi) via le dashboard NuxtHub. C'est un OAuth one-shot — NuxtHub obtient les permissions pour créer et gérer les ressources Cloudflare (Pages, D1, KV) en ton nom.

- [ ] Créer un compte sur [admin.hub.nuxt.com](https://admin.hub.nuxt.com) (login GitHub)
- [ ] Lier ton compte Cloudflare (free tier) via le dashboard NuxtHub
  - [Doc : NuxtHub — Deploy](https://hub.nuxt.com/docs/getting-started/deploy)

### 8.2 Variables d'environnement

On configure les secrets de production dans le dashboard NuxtHub (ou directement dans Cloudflare Pages). Ce sont les mêmes variables que dans le `.env` local : le secret de session pour chiffrer les cookies, et le hash du mot de passe admin. Ces valeurs ne sont jamais commitées dans le code — elles sont injectées à l'exécution par la plateforme.

- [ ] Configurer dans le dashboard NuxtHub (ou Cloudflare) :
  - `NUXT_SESSION_PASSWORD` (le secret de session)
  - `NUXT_ADMIN_PASSWORD_HASH` (le hash du mot de passe admin)

### 8.3 Premier déploiement

On lance le déploiement avec `npx nuxthub deploy`. NuxtHub build le projet, crée automatiquement le projet Cloudflare Pages, la base D1, et déploie le tout. On obtient une URL en `.nuxt.dev`. On vérifie que l'app fonctionne : login, création de page, édition, persistance après rafraîchissement.

- [ ] Lancer `npx nuxthub deploy`
- [ ] Vérifier que l'app est accessible sur l'URL générée
- [ ] Vérifier le login
- [ ] Créer une page de test et vérifier la persistance

### 8.4 Configurer un domaine custom (optionnel)

Si tu as un nom de domaine, tu peux le pointer vers Cloudflare Pages via un CNAME DNS. Sinon, l'URL `.nuxt.dev` fournie par NuxtHub est parfaitement fonctionnelle et suffisante pour un usage personnel.

- [ ] Si tu as un domaine : le configurer dans Cloudflare DNS
- [ ] Sinon : l'URL `.nuxt.dev` fournie par NuxtHub suffit

### 8.5 Tester depuis le proxy professionnel

On vérifie le besoin initial : que l'app est utilisable derrière le proxy d'entreprise. C'est le test le plus important — c'est la raison d'être du projet. On teste le login, la navigation, l'édition, et la sauvegarde depuis le réseau professionnel.

- [ ] Accéder à l'app depuis ton réseau professionnel
- [ ] Vérifier que tout fonctionne (login, navigation, édition, sauvegarde)

---

## 9. Polish MVP

### 9.1 Responsive

On adapte l'interface pour les écrans mobiles. La sidebar doit devenir rétractable : sur petit écran, elle est masquée par défaut et s'ouvre via un bouton hamburger. Quand elle est fermée, l'éditeur prend toute la largeur. On utilise un état réactif `isSidebarOpen` et les breakpoints Tailwind (`md:` pour basculer entre les modes).

- [ ] Sidebar rétractable sur mobile (hamburger menu)
- [ ] Éditeur pleine largeur sur mobile quand sidebar fermée
- [ ] Tester sur un écran de téléphone (DevTools ou vrai appareil)

### 9.2 États vides et erreurs

On gère les cas limites pour que l'app ne laisse jamais l'utilisateur face à un écran blanc ou un bug silencieux. Page d'accueil vide → message + CTA. Page qui n'existe pas → redirection vers `/`. Erreur API → toast d'erreur via `<UToast>` de Nuxt UI pour que l'utilisateur sache que quelque chose a échoué.

- [ ] Page vide quand aucune page n'existe (CTA "Créer une page")
- [ ] 404 quand une page n'existe pas (redirection vers `/`)
- [ ] Toast d'erreur si une requête API échoue (`<UToast>`)

### 9.3 UX de l'éditeur

On peaufine l'expérience d'édition. Le focus automatique place le curseur dans l'éditeur dès qu'on ouvre une page, sans avoir à cliquer. Le placeholder "Commencez à écrire..." guide l'utilisateur quand la page est vide — c'est l'extension `@tiptap/extension-placeholder` qu'on ajoute au `StarterKit`.

- [ ] Focus automatique dans l'éditeur à l'ouverture d'une page
- [ ] Placeholder "Commencez à écrire..." quand le contenu est vide
  ```ts
  import Placeholder from '@tiptap/extension-placeholder'
  // pnpm add @tiptap/extension-placeholder

  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: 'Commencez à écrire...' }),
  ]
  ```
  - [Doc : Tiptap — Placeholder](https://tiptap.dev/docs/editor/extensions/functionality/placeholder)

### 9.4 Renommage inline dans la sidebar

On permet de renommer une page directement depuis la sidebar, sans avoir à l'ouvrir. Un double-clic sur le titre dans `PageTreeItem` remplace le texte par un `<input>` pré-rempli avec le titre actuel. Au blur (clic ailleurs) ou à la touche Entrée, on sauvegarde le nouveau titre via `updatePage` et on repasse en mode texte. La touche Échap annule la modification.

- [ ] Double-clic sur un titre dans `PageTreeItem` → passer en mode édition (input inline)
- [ ] Au blur ou Enter → sauvegarder le nouveau titre

### 9.5 Vérification finale

On fait un parcours complet de l'application du début à la fin pour valider que tout fonctionne ensemble. C'est le test d'acceptance du MVP : si ce parcours passe, l'app est utilisable au quotidien.

- [ ] Parcours complet : login → créer page → écrire → créer sous-page → rechercher → supprimer → logout
- [ ] Tester sur mobile
- [ ] Tester derrière le proxy
- [ ] Commit final + tag `v0.1.0`
