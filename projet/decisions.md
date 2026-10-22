# Décisions : wiki.dev

> Entrées les plus récentes **en haut**. 3 à 5 lignes par décision. On ne supprime pas : on écrit la décision qui remplace l'ancienne.

---

## D-007 · 2026-10-22 · Projet = page racine de Projets + sous-pages du noyau

- **Contexte :** Gestion de projet N1 (méthode Colonne dans wiki-dev) ; il faudra ensuite ajouter des briques facultatives (N2).
- **Choix :** un projet est une page racine de la section Projets, avec un `status` en base (idée / en cours / terminé, null ailleurs). Sa page est la fiche ; Colonne, DoD, journal et décisions sont des sous-pages pré-remplies (modèles en JSON TipTap côté serveur, repris de `methode/templates/`). N2 mixte : grosses briques en sous-pages, petites en blocs « / ». Écartés : une seule page à sections (page longue, journal noyé), table `projects` séparée, briques toutes en sous-pages ou toutes en blocs.
- **Pourquoi :** réutilise l'arborescence (le noyau est au niveau 2 sur 5) sans nouvel écran ; le statut est la seule donnée structurée utile pour l'instant (principe « données structurées seulement si ça se répète »).
- **Conséquences :** le « + » de Projets crée toujours un projet ; espace et statut ne sont plus dans la fiche ; vue d'ensemble des projets à décider plus tard.

---

## D-006 · 2026-10-21 · Hébergement : Vercel + Turso (remplace D-001)

- **Contexte :** `*.workers.dev` est en liste noire du proxy pro (`Liste_noire_URL`), alors que `*.vercel.app` passe. D-001 n'est donc pas validée.
- **Choix :** app sur Vercel (Hobby, région `dub1`), DB sur Turso (libSQL, `aws-eu-west-1`), images sur Vercel Blob. NuxtHub bascule tout seul sur Turso si `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` sont définies. Écartés : Vercel + Neon (Postgres, il faudrait réécrire schéma et migrations), domaine perso sur Cloudflare (un domaine récent risque lui aussi d'être bloqué, on ne le saurait qu'après l'achat).
- **Pourquoi :** testé depuis le poste pro le 2026-10-21 (connexion, création et modification d'une page, données retrouvées depuis la maison). On reste sur SQLite et Drizzle sans changer de code, seule la config change.
- **Conséquences :** 2 fournisseurs au lieu d'un. Pages N1 images : Vercel Blob au lieu de R2. Socle N1 : sauvegarde = export Turso. Usage limité au non commercial (Hobby). Le Worker et la base D1 Cloudflare ne servent plus.

---

## D-005 · 2026-10-18 · Recadrage : développement délégué à Claude, v1 réduite

- **Contexte :** l'apprentissage de Unity / C# (pour le travail) devient prioritaire ; wiki.dev doit servir à l'accompagner, donc être fini vite. Je ne code plus le projet.
- **Choix :** Claude code, je valide (tests réels, choix). v1 = Socle N0-N1, Accès N0, Pages N0-N1 (avec blocs de code et images), Retrouver N0-N1, sections Projets / Doc, Mobile N0. `space` reste en base sans switch ; ressources = une page de doc. Méthode figée, tenue au minimum par Claude. Écartés : niveau 0 complet sans images (captures indispensables pour Unity), switch Perso / Pro dès la v1, section Ressources.
- **Pourquoi :** le plus court chemin vers un outil utilisé ; les objectifs d'apprentissage Nuxt / méthode n'ont plus lieu d'être.
- **Conséquences :** fiche et Colonne recadrées ; images remontées de Pages N2 à N1 ; réévaluation fin octobre 2026 (sinon solution existante).

---

## D-004 · 2026-10-16 · Modèle : `space` et `section` comme colonnes de la page

- **Contexte :** Espaces N0 retiré (non observable) mais le perso/pro doit exister avant la migration Notion ; Gestion de projet N0 range une page dans une section.
- **Choix :** table `pages` avec `space` ('perso' | 'pro', défaut 'perso', invisible jusqu'à Espaces N1) et `section` ('project' | 'doc'). Écartés : ajouter `space` seulement en N1 (migration après import des données), pages racines « Projets » / « Documentation » (dépend de l'arborescence de Retrouver N2).
- **Pourquoi :** deux colonnes simples suffisent au N0 et au filtrage de la sidebar, sans migration de données plus tard.
- **Conséquences :** les sous-pages (Retrouver N2, `parentId`) devront hériter `space` et `section` de leur parent.

---

## D-003 · 2026-10-16 · Éditeur : UEditor (Nuxt UI) + contenu en JSON TipTap

- **Contexte :** Pages N0 (texte brut) puis N1-N2 (mise en forme, checklists, code, images) ; blocs « méthode » envisagés plus tard.
- **Choix :** composant `UEditor` de Nuxt UI v4 (basé sur TipTap), contenu stocké en JSON TipTap. Écartés : TipTap nu (toute l'UI à construire), textarea Markdown (jeté au N1), stockage Markdown (conversion à chaque sauvegarde, pertes sur blocs custom) ou HTML.
- **Pourquoi :** cohérent avec la stack, toolbar et menus prêts, extensible par extensions TipTap ; le JSON est le format natif, sans perte.
- **Conséquences :** vérifier `UEditor` en début de tranche Pages N0 ; recherche par titre seulement (Retrouver N1), le plein texte dans du JSON sera à traiter s'il devient nécessaire ; export Markdown éventuel plus tard.

---

## D-002 · 2026-10-16 · Stack : Nuxt 4 + Nuxt UI v4, auth nuxt-auth-utils

- **Contexte :** stack d'entreprise visée (fiche), hébergement Cloudflare via NuxtHub (D-001), mono-utilisateur avec mot de passe unique (Accès N0).
- **Choix :** Nuxt 4 + Nuxt UI v4 ; DB D1 via Drizzle (NuxtHub) ; authentification `nuxt-auth-utils` (session en cookie chiffré, mot de passe hashé en variable d'environnement). Écartés : Tailwind seul (temps passé sur l'UI), Better Auth (surdimensionné pour 1 utilisateur), Cloudflare Access (auth hors de l'app, rien à apprendre).
- **Pourquoi :** stack déjà pratiquée, composants prêts (sidebar, formulaires, éditeur), compatible Workers ; auth en quelques lignes, sans table en DB.
- **Conséquences :** pas de table utilisateur ; renforcement (limitation des tentatives, 2FA) repoussé à Accès N3, Better Auth à reconsidérer à ce moment-là.

---

## D-001 · 2026-10-16 · Hébergement : Cloudflare (Workers + D1 + R2) via NuxtHub

- **Contexte :** Notion perd des sauvegardes derrière le proxy (cause non investiguée, probablement sa synchro temps réel). Contraintes : 100 % gratuit, pas de machine allumée à la maison, mono-utilisateur.
- **Choix :** Cloudflare Workers + D1 (DB) + R2 (images) via NuxtHub. Écartés : local (pas de machine allumée), VPS Oracle (maintenance, arrêt pour inactivité, quotas instables), Netlify (~20 déploiements/mois), Vercel + Turso/Neon (2-3 fournisseurs), PocketBase (2e hébergement, doublon avec le backend Nuxt).
- **Pourquoi :** un seul fournisseur pour app, DB et fichiers, zéro maintenance, quotas gratuits largement suffisants en mono-utilisateur, déjà pratiqué (veille-analytics, dashboard).
- **Conséquences :** à valider par un test depuis le poste pro (page + sauvegarde sur `*.workers.dev`), sinon domaine perso (~10 €/an) ou repli Vercel + Neon ; runtime Workers (pas un Node complet) ; DB SQLite/Drizzle (D1) ; images sur R2 (Pages N2) ; vérifier l'export/sauvegarde D1 (Socle N1).
