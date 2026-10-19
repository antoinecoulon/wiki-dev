# wiki-dev

App personnelle pour **remplacer Notion** : documentation de dev (perso et pro) et suivi de projets, en un seul endroit accessible, y compris derrière le proxy d'entreprise. Usage prioritaire : accompagner mon apprentissage de **Unity / C#** (notes, code, captures).

## Stack et structure

- `src/` : l'app. Nuxt 4 + Nuxt UI v4 + NuxtHub sur Cloudflare (Workers, D1/Drizzle, R2), auth nuxt-auth-utils, éditeur UEditor en JSON TipTap. Gestionnaire : pnpm.
- `projet/` : fiche, Colonne (avec la v1 et la tranche en cours), DoD, journal, `decisions.md`.
- `methode/` : la **méthode Colonne**, figée le 2026-10-18. Voir `methode/README.md`.

## Comment travailler avec moi

- **Depuis le 2026-10-18 (D-005), tu codes et je valide.** Je teste dans l'app réelle (notamment depuis le poste pro) et je tranche les choix. Objectif : finir la v1 vite, sans sur-ingénierie.
- Présente les choix sous forme de questions à options (Q/R) avec une recommandation. Je garde la main sur les choix ; tu signales les oublis et incohérences.
- Méthode au minimum, tenue par toi : en fin de session, coche la Colonne et ajoute une entrée au journal (fait / blocage / prochaine action) ; une décision dans `decisions.md` seulement si elle est structurante. Pas de documentation « au cas où ».
- Une seule tranche en cours ; suivre l'ordre de la section « Version 1 » de la Colonne. DoD : `projet/dod.md`.
- **Guide technique** (`documentation/nuxt-nuxthub-cloudflare.md`) : en fin de tranche, s'il y a un concept réutilisable (auth, R2, éditeur…), y ajouter une section courte et générique (config, exemple, pièges rencontrés). Rien sur ce qui est propre à wiki-dev.
- Réponses en **français**.

## État (2026-10-19)

- Recadrage fait (D-005) : v1 définie dans la Colonne.
- App déployée sur `wiki-dev.a-antoinecoulon.workers.dev`, **bloquée par le proxy pro** (`Liste_noire_URL`) : D-001 non validée. L'utilisateur interroge l'IT et teste `*.vercel.app` / `*.pages.dev` ; la suite sera D-006.
- Tranche en cours : *Pages N1 (éditeur)*. Accès N0, Pages N0, Retrouver N0 et Gestion de projet N0 faites, l'app est protégée par mot de passe (reste le test derrière le proxy, avec D-006).
