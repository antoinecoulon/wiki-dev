# Wiki-dev - Dossier de conception

> Application facilement accessible permettant de prendre et conserver des notes de développement, de suivre des projets, d'organiser son travail et ses pensées.

## Contexte

J'utilise au quotidien l'application Notion, qui me permet de prendre des notes sur mes projets ou sur des technologies, que ce soit en environnement professionnel ou personnel. L'application me permet aussi de suivre mes projets avec des kanban, tableaux... L'édition et l'organisation est simple et facile. Cependant l'application me pose de gros problèmes d'accessibilité: elle a tendance à être lentre et à buguer. Surtout, elle est quasiment innutilisable derrière le proxy de mon environnement professionnel.

Je souhaite développer une application qui comprend les fonctionnalités dont j'ai réellement besoin, pas plus ni moins. Qu'elle soit accessible rapidement et simplement quand je développe, en entreprise ou chez moi. Elle doit me permettre une utilisation proche de Notion, avec seulement les fonctionnalités que je vais utiliser. 

Ce que je ne veux pas: j'ai développé dev-docs, une application web qui était accessible facilement de partout et dans laquelle je pouvais stocker du savoir de développement. Elle ne me permettait pas de suivre mes projets facilement, et il fallait que je clone le projet pour y coller des fichiers .md pour créer des pages ou pour les modifier. Ce n'était pas pratique.

## Stack technique

| Brique | Technologie | Rôle |
|---|---|---|
| Framework | [Nuxt 4](https://nuxt.com/docs/4.x/getting-started/introduction) | Full-stack (frontend + server routes, pas de backend séparé) |
| UI | [Nuxt UI 3](https://ui.nuxt.com/) | Composants UI, thème, responsive |
| Éditeur | [Tiptap](https://tiptap.dev/docs/editor/getting-started/install/nuxt) (@tiptap/vue-3) | Éditeur bloc riche (formatage, réorganisation drag & drop) |
| Backend/BDD | [NuxtHub](https://hub.nuxt.com/) (@nuxthub/core) | Intégration Cloudflare D1 (SQLite), KV, Blob storage |
| Auth | [nuxt-auth-utils](https://nuxt.com/modules/auth-utils) | Authentification mono-utilisateur, sessions cookies sécurisés |
| Hébergement | [Cloudflare Pages](https://pages.cloudflare.com/) (free tier) | Déploiement edge, via `npx nuxthub deploy` |
| Package manager | [pnpm](https://pnpm.io/) | Rapide, compatible Nuxt/NuxtHub sans friction |

### Justifications

- **Nuxt full-stack** : les server routes Nuxt couvrent tous les besoins API. Pas de backend C# ou Node séparé — un seul projet, un seul déploiement.
- **NuxtHub** : abstraction zero-config au-dessus de Cloudflare D1/KV/R2. Dev local sans compte Cloudflare (émulation via wrangler). Multi-vendor depuis v0.10 (migration possible vers Vercel/Netlify plus tard).
- **Tiptap** : standard de l'éditeur riche dans l'écosystème Vue. Open source, StarterKit gratuit suffisant. Le contenu est sérialisé en JSON (stocké en D1).
- **nuxt-auth-utils** : créé par Atinux (créateur de Nuxt/NuxtHub), intégration native. Sessions par cookies scellés, support OAuth et mot de passe. Pour l'instant : mono-utilisateur (login simple ou OAuth GitHub).
- **Cloudflare free tier** : illimité en requêtes, 10M reads D1/jour, 100k writes/jour, 5GB D1. Suffisant pour un usage personnel.
- **pnpm** : mature, rapide, zéro problème de compatibilité connu avec la stack. Bun écarté pour l'instant (frictions documentées avec Nuxt 4 + wrangler).

## Fonctionnalités

### MVP (V0) — Minimum utilisable
- Créer, éditer, supprimer une page (éditeur Tiptap)
- Navigation par arborescence libre (pages / sous-pages illimitées, comme Notion)
- Recherche basique par titre
- Authentification (accès protégé dès le départ)

### V1 — Besoin complet
- Kanban (suivi de projets)
- Recherche full-text (contenu des pages)
- Réorganisation de l'arborescence (drag & drop dans la sidebar)
- Fonctionnalités de partage rapide (à définir)

## Architecture

### Modèle de données — Adjacency List

Une seule table `pages` avec `parent_id` auto-référencé pour l'arborescence libre.

```sql
CREATE TABLE pages (
  id         TEXT PRIMARY KEY,  -- nanoid ou uuid
  parent_id  TEXT REFERENCES pages(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'Sans titre',
  content    TEXT,              -- JSON Tiptap (édition)
  content_text TEXT,            -- texte brut extrait (recherche full-text)
  position   INTEGER NOT NULL DEFAULT 0,  -- ordre entre pages sœurs
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_pages_parent ON pages(parent_id, position);
```

- **parent_id NULL** = page racine
- **position** = ordre d'affichage parmi les pages ayant le même parent
- **content** = JSON Tiptap sérialisé, chargé/sauvegardé tel quel par l'éditeur
- **content_text** = texte brut extrait côté serveur à chaque sauvegarde, utilisé pour la recherche
- Chargement de l'arbre complet via `WITH RECURSIVE` (supporté par D1/SQLite)

### Accès aux données — Drizzle ORM

[Drizzle](https://orm.drizzle.team/) pour l'accès typé à D1, avec `drizzle-kit` pour les migrations.
[Intégration documentée avec NuxtHub](https://hub.nuxt.com/docs/recipes/drizzle).

Le schéma Drizzle reflète la table ci-dessus et sert de source de vérité pour les types TypeScript.

### API — Server routes Nuxt

Routes REST classiques, protégées par le middleware auth :

```
server/
├── api/
│   ├── auth/          # login, logout, session
│   └── pages/
│       ├── index.get.ts       # GET    /api/pages         → arbre complet
│       ├── index.post.ts      # POST   /api/pages         → créer une page
│       ├── [id].get.ts        # GET    /api/pages/:id     → une page + contenu
│       ├── [id].put.ts        # PUT    /api/pages/:id     → modifier (titre, contenu, position, parent)
│       └── [id].delete.ts     # DELETE /api/pages/:id     → supprimer (cascade enfants)
├── database/
│   ├── schema.ts              # schéma Drizzle
│   └── migrations/            # migrations drizzle-kit
├── middleware/
│   └── auth.ts                # vérifie la session sur toutes les routes /api (sauf login)
└── utils/
    └── extract-text.ts        # extraction texte brut depuis JSON Tiptap
```

### Structure du projet — Par couche (convention Nuxt)

```
wiki-dev/
├── app/
│   ├── components/
│   │   ├── editor/            # TiptapEditor, Toolbar, etc.
│   │   └── navigation/        # Sidebar, PageTree, PageTreeItem
│   ├── composables/
│   │   ├── usePages.ts        # CRUD pages, état arbre
│   │   └── useEditor.ts       # config Tiptap, sauvegarde
│   ├── pages/
│   │   ├── index.vue          # page d'accueil / racine
│   │   ├── login.vue          # page de connexion
│   │   └── [...slug].vue      # page dynamique (affiche l'éditeur)
│   └── layouts/
│       └── default.vue        # sidebar navigation + slot contenu
├── server/                    # (voir section API ci-dessus)
├── docs/
│   └── conception.md
├── drizzle.config.ts
├── nuxt.config.ts
└── package.json
```

### Flux principal

```
[Navigateur] → ouvre une page → GET /api/pages/:id
            → édite le contenu → Tiptap (local)
            → sauvegarde → PUT /api/pages/:id
                            ├── stocke le JSON Tiptap dans `content`
                            ├── extrait le texte brut → `content_text`
                            └── met à jour `updated_at`
```
