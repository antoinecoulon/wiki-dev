# wiki-dev

App personnelle pour **remplacer Notion** : documentation de dev (perso et pro) et suivi de projets, en un seul endroit accessible, y compris derrière le proxy d'entreprise. Usage prioritaire : accompagner mon apprentissage de **Unity / C#** (notes, code, captures).

## Stack et structure

- `src/` : l'app. Nuxt 4 + Nuxt UI v4 + NuxtHub sur Vercel + Turso (libSQL/Drizzle, images Vercel Blob, D-006), auth nuxt-auth-utils, éditeur UEditor en JSON TipTap. Gestionnaire : pnpm.
- `projet/` : fiche, Colonne (avec la v1 et la tranche en cours), DoD, journal, `decisions.md`.
- `methode/` : la **méthode Colonne**, figée le 2026-10-18. Voir `methode/README.md`.

## Comment travailler avec moi

- **Depuis le 2026-10-18 (D-005), tu codes et je valide.** Je teste dans l'app réelle (notamment depuis le poste pro) et je tranche les choix. Objectif : finir la v1 vite, sans sur-ingénierie.
- Présente les choix sous forme de questions à options (Q/R) avec une recommandation. Je garde la main sur les choix ; tu signales les oublis et incohérences.
- Méthode au minimum, tenue par toi : en fin de session, coche la Colonne et ajoute une entrée au journal (fait / blocage / prochaine action) ; une décision dans `decisions.md` seulement si elle est structurante. Pas de documentation « au cas où ».
- Une seule tranche en cours ; suivre l'ordre de la section « Version 1 » de la Colonne. DoD : `projet/dod.md`.
- **Guide technique** (`documentation/nuxt-nuxthub.md`) : en fin de tranche, s'il y a un concept réutilisable (auth, stockage, éditeur…), y ajouter une section courte et générique (config, exemple, pièges rencontrés). Rien sur ce qui est propre à wiki-dev.
- Réponses en **français**.
- **Skills à charger** selon la tâche : `nuxt` (routes serveur, pages, middleware), `nuxt-ui` (composants, `UEditor`), `vercel:vercel-storage` (Blob), `vercel:vercel-cli` (déploiement, env, logs), `pnpm` (dépendances).

## État (2026-10-23)

- Recadrage fait (D-005) : v1 définie dans la Colonne.
- App déployée sur `wiki-dev-blond.vercel.app` (déploiement auto à chaque push sur `main`, CI lint + typecheck en GitHub Actions), validée derrière le proxy pro (D-006).
- **v1 terminée** (Socle N0-N1, Accès N0, Pages N0-N1, Retrouver N0-N1, Gestion de projet N0, Mobile N0). Sauvegardes : `pnpm run backup` depuis `src/` → `backups/` (gitignoré).
- Migration Notion / dev-docs : à part, petit à petit, sans bloquer les tranches.
- Gestion de projet N1 (D-007) et N2 (briques à la demande, kanban des tranches) validées, Performance N0 validée (liste des pages sans contenu). Aucune tranche en cours.
