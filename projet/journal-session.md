# Journal de session : wiki.dev

> Entrées les plus récentes **en haut**. En début de session, lire la première entrée.
> En fin de session, 3 champs (2 min). S'arrêter de préférence quand on sait quoi faire ensuite.

---

## 30 · 2026-10-23 · <1h> · tranche : Retrouver N3

- **Fait :** colonne `favorite` (migration 0003, testée sur SQLite), `PATCH` accepte `favorite` sans changer `updatedAt`. Étoile à côté du titre. Sidebar : groupes « Favoris » et « Récentes » (5 dernières modifiées) en haut, pour l'espace affiché. Lint + typecheck OK.
- **Blocage / question :** pas testé dans l'app (voir « À tester »). Migration appliquée au démarrage en prod, sans sauvegarde (base de test).
- **➜ Prochaine action :** tester favoris et récentes.

---

## 29 · 2026-10-23 · <1h> · tranche : Pages N3

- **Fait :** Gestion de projet N2 validée et close. Pages N3 : poignée `UEditorDragHandle` à gauche du bloc survolé, « + » (dessous, Alt+clic dessus, ouvre « / ») et ⡇ (glisser, ou menu Monter / Descendre / Dupliquer / Supprimer), masquée sur mobile. Lint + typecheck OK.
- **Blocage / question :** aucun, validée en prod (poignée bien placée) : Pages N3 terminée. Poignée des blocs ajoutée au guide technique.
- **➜ Prochaine action :** choisir la prochaine tranche dans la Colonne.

---

## 28 · 2026-10-23 · <1h> · tranche : Gestion de projet N2 (kanban des tranches)

- **Fait :** composant `ColonneKanban` : lit la grille de la sous-page Colonne (cases □ ◧ ■ avec texte), 3 colonnes, menu sur la carte qui réécrit le symbole dans le contenu (sauvegarde auto). Bascule « Grille / Kanban » sur la Colonne d'un projet. Lecture et réécriture testées sur le modèle de Colonne (texte en gras compris) ; lint + typecheck OK.
- **Blocage / question :** aucun, kanban validé en prod (smartphone compris) : Gestion de projet N2 terminée. Lecture / réécriture du JSON TipTap hors éditeur ajoutée au guide technique.
- **➜ Prochaine action :** choisir la prochaine tranche dans la Colonne.

---

## 27 · 2026-10-23 · <1h> · tranche : Gestion de projet N2 (briques)

- **Fait :** brique C4 : menu « Brique » sur la page d'un projet, crée une sous-page « C4 » pré-remplie (tableaux Contexte et Conteneurs, emplacement pour la capture), une seule par projet (option grisée + refus 409 côté API). Validée en prod. Puis briques modèle de données (un tableau par entité, relations, capture), validée en prod, et wireframes (un bloc par écran : route, capture, états), validée en prod. Petites briques dans le menu « / » des pages de Projets (checklist de tranche, entrée de journal) : modèles déplacés dans `shared/utils/` pour servir aussi au client, contenu du noyau inchangé (comparé). Modèles validés contre le schéma TipTap ; lint + typecheck + build OK.
- **Blocage / question :** aucun, petites briques validées en prod : briques à la demande terminées. Section `shared/utils/` et menu « / » ajoutés au guide technique.
- **➜ Prochaine action :** kanban des tranches (dernier point de Gestion de projet N2).

---

## 26 · 2026-10-23 · <1h> · tranche : Performance N0

- **Fait :** `GET /api/pages` ne renvoie plus `content` (sélection de toutes les colonnes sauf le contenu) ; aucun appelant ne le lisait (sidebar, accueil, page). Lint + typecheck OK. Testé en prod : sidebar, accueil, recherche et page OK, tranche validée. Astuce `getTableColumns` ajoutée au guide technique.
- **Blocage / question :** aucun.
- **➜ Prochaine action :** choisir la prochaine tranche (Gestion de projet N2, C4 en premier) ; migration en volume possible.

---

## 25 · 2026-10-23 · <1h> · tranche : retours Gestion de projet N1

- **Fait :** états de la Colonne validés (grille pré-remplie, clic □ → ◧ → ■, aussi sur smartphone). Retour « les sous-pages d'un projet ne remontent pas » : pas un bug (la remontée marche, la suppression n'avait pas été confirmée), mais choix de supprimer toute la branche d'un projet ; les autres pages gardent la remontée. Testé en local (projet avec sous-sous-page, page Doc avec sous-page).
- **Blocage / question :** logs Vercel inaccessibles depuis le MCP (403) et CLI `vercel` absente de WSL : diagnostic en prod impossible, à prévoir avec le point « logs » des notés pour plus tard.
- **➜ Prochaine action :** tester la suppression d'un projet, puis choisir la prochaine tranche (Gestion de projet N2 ou Performance N0).

---

## 24 · 2026-10-22 · <1h> · tranche : retours Gestion de projet N1

- **Fait :** Gestion de projet N1 validée, projet wiki-dev créé dans wiki-dev (base de prod vidée avant, sauvegarde faite). Retours : grille de la Colonne pré-remplie avec « □ » ; extension d'éditeur `colonne-state` (un clic fait tourner □ → ◧ → ■, hors blocs de code), testée sur un état ProseMirror.
- **Blocage / question :** C4 prédéfini → Gestion de projet N2 ; accès de Claude à l'app noté pour plus tard.
- **➜ Prochaine action :** tester le correctif, puis choisir la prochaine tranche (Gestion de projet N2 ou Performance N0 avant une migration en volume).

---

## 23 · 2026-10-22 · <1h> · tranche : Gestion de projet N1

- **Fait :** migration Notion / dev-docs sortie du chemin (petit à petit). Cadrage N1 (D-007) puis livraison : colonne `status` (migration 0002), le « + » de Projets crée la fiche + 4 sous-pages pré-remplies d'après `methode/templates/`, sélecteur de statut sous le titre du projet, badge du statut sur ses sous-pages. Modèles validés contre le schéma TipTap ; API et rendu serveur testés en local.
- **Blocage / question :** pas testé dans l'app : voir « À tester ». Accès N1 et Mobile N1 probablement déjà couverts par les tests du jour, à confirmer pour les cocher. `GET /api/pages` renvoie le contenu de toutes les pages : à alléger avant une migration en volume.
- **➜ Prochaine action :** tests « À tester », puis créer le projet wiki-dev dans wiki-dev.

---

## 22 · 2026-10-22 · <1h> · tranche : retours de test

- **Fait :** tests des 4 tranches du 2026-10-22 validés. Correctifs des retours : sous-menus 1/2/3 lignes ou colonnes, grisé des menus plus marqué (`app.config`), bouton d'espace replié en couleur primaire + infobulle, icônes nuage pour la sauvegarde, sous-pages directes listées sous le titre, arborescence limitée à 5 niveaux (client + API, vérifiée seulement au changement de parent pour ne pas bloquer l'autosave des pages déjà plus profondes), titre présélectionné sur une page neuve. Lint + typecheck OK, requêtes de profondeur testées sur SQLite.
- **Blocage / question :** correctifs pas testés dans l'app ; retours notés pour plus tard (thème, icône de page, liens/groupes, erreurs et logs) dans la Colonne.
- **➜ Prochaine action :** revalider « À tester », puis migration Notion.

---

## 21 · 2026-10-22 · <1h> · tranche : Personnalisation N0

- **Fait :** page d'accueil de l'espace affiché : « Projets récents » (cartes, pages racines de Projets classées par activité dans leur branche) et « Pages récentes » (8 dernières), dates relatives (`NuxtTime`), « Nouvelle page » dans la barre. Choisie pour ne pas retoucher sidebar ni barre de page, déjà non testées. Rendu serveur vérifié en local. Déployé par push.
- **Blocage / question :** 4 tranches livrées sans test dans l'app : voir « À tester ».
- **➜ Prochaine action :** tests « À tester » depuis le PC, puis migration Notion.

---

## 20 · 2026-10-22 · <1h> · tranche : Retrouver N2

- **Fait :** arborescence. Colonne `parent_id` (migration 0001, sauvegarde de la base faite avant). Sidebar en arbre (branche de la page ouverte dépliée) ; sous le titre d'une page : fil d'Ariane, sélecteur « page parente » avec recherche, bouton « Sous-page ». Une sous-page hérite de l'espace et de la section de son parent ; changer l'espace ou la section d'une page la remet à la racine et emmène ses sous-pages. Suppression : les sous-pages remontent d'un niveau. API testée en local (héritage, boucles, section, propagation, suppression), rendu serveur vérifié. Déployé par push.
- **Blocage / question :** interface non testée (session depuis le téléphone) : voir « À tester ». « Nouvelle sous-page » au survol dans la sidebar abandonné (le slot de `UNavigationMenu` remplace le chevron) : bouton sur la page à la place.
- **➜ Prochaine action :** tests « À tester » depuis le PC, puis migration Notion.

---

## 19 · 2026-10-22 · <1h> · tranche : Espaces N1

- **Fait :** switch Perso / Pro en haut de la sidebar (onglets ; bouton de bascule quand elle est repliée), qui filtre sidebar et recherche. Espace retenu par appareil (cookie `space`). Nouvelle page créée dans l'espace affiché ; sélecteur d'espace sur la page (couvre aussi Espaces N2 « déplacer ») et la sidebar suit l'espace de la page ouverte. API : `space` accepté en POST et PATCH. Déployé par push.
- **Blocage / question :** pas testé (session depuis le téléphone) : voir « À tester » dans la Colonne.
- **➜ Prochaine action :** tests « À tester » depuis le PC, puis migration Notion (en rangeant les pages pro dans Pro).

---

## 18 · 2026-10-22 · <1h> · tranche : Pages N2

- **Fait :** tranche choisie pour la migration Notion (les tableaux collés ne doivent pas perdre leur forme). Les citations existaient déjà ; ajout des tableaux (TableKit) : bouton « Tableau » dans la barre (insérer, ajouter ligne / colonne, supprimer ligne / colonne / tableau) et entrée « Tableau » dans le menu « / ». Lint, typecheck et build OK, déployé par push. `gh` installé et connecté dans WSL : Claude peut pousser depuis le remote.
- **Blocage / question :** session depuis le téléphone, rien n'a été testé dans l'app : tests notés dans la section « À tester » de la Colonne.
- **➜ Prochaine action :** faire les tests « À tester » depuis le PC, puis migration Notion.

---

## 17 · 2026-10-22 · <1h> · hors tranche : CI

- **Fait :** diagnostic des déploiements en « Error » : c'étaient les déploiements auto Vercel à chaque push, construits depuis la racine du dépôt (Root Directory `.`) ; la prod (dernier `pnpm run deploy`) était à jour. Root Directory passé à `src` : chaque push sur `main` déploie en prod. Workflow GitHub Actions lint + typecheck. Script `deploy` retiré (ne marche plus avec ce réglage).
- **Blocage / question :** /
- **➜ Prochaine action :** migration manuelle depuis Notion, puis choisir la prochaine tranche.

---

## 16 · 2026-10-21 · <1h> · tranche : Socle N1

- **Fait :** `pnpm run backup` (depuis `src/`) : dump SQL horodaté de la base Turso dans `backups/db` (30 derniers gardés, dump incomplet refusé) et copie des nouvelles images du store Blob dans `backups/images` ; `backups/` gitignoré. Restauration testée dans une base jetable (25 pages sur 25). CI non retenue. **v1 terminée.**
- **Blocage / question :** `turso db create --from-dump` crée une base vide sans erreur → restaurer en rejouant le dump avec `turso db shell`. Sauvegardes sur la même machine que le repo : pas de copie hors du PC. Pas de script pour remettre les images dans le store.
- **➜ Prochaine action :** migration manuelle depuis Notion, puis choisir la prochaine tranche.

---

## 15 · 2026-10-21 · <1h> · tranche : Mobile N0

- **Fait :** barre du haut en icônes seules sous 640 px (statut, suppression) ; blocs de code : le code démarre sous le sélecteur de langage sur écran étroit. Le reste (images, code qui passe à la ligne, sidebar en tiroir) était déjà géré par Nuxt UI. Déployé et validé sur téléphone.
- **Blocage / question :** surcharger un style de `UEditor` (`[&_pre]:…`) demande `!` (sélecteur plus spécifique). L'éditeur reste modifiable sur mobile (lecture seule non imposée).
- **➜ Prochaine action :** tranche Socle N1 (sauvegardes de la base Turso), puis migration manuelle depuis Notion.

---

## 14 · 2026-10-21 · <1h> · tranche : Retrouver N1

- **Fait :** recherche par titre en palette (`UDashboardSearch`) : bouton « Rechercher » en haut de la sidebar + Ctrl+K, recherche floue côté client sur la liste déjà chargée, résultats groupés Projets / Documentation. Sidebar repliée réparée : barre de défilement masquée (elle coupait le surlignage), tooltips sur les icônes, icône d'accueil à la place de « w. ». Déployé et validé en ligne.
- **Blocage / question :** `NavigationMenuItem` non assignable à `CommandPaletteItem` (type de `chip`) → items reconstruits. `GET /api/pages` renvoie le contenu de toutes les pages : à alléger quand le volume grossira (migration Notion).
- **➜ Prochaine action :** tranche Mobile N0 (une page lisible sur smartphone).

---

## 13 · 2026-10-21 · ~1h30 · tranche : Pages N1 images

- **Fait :** images collées, glissées ou choisies (bouton dans la barre et le menu « / »), 4 Mo max, PNG/JPEG/GIF/WebP ; store Vercel Blob **privé** (`dub1`) via `@vercel/blob` direct, servi par `/images/…` protégé par le login. Bloc de code : Tab / Shift+Tab, paires auto-fermantes, fermeture des balises en HTML/XML, Entrée qui garde l'indentation. Déployé et validé en ligne, y compris derrière le proxy.
- **Blocage / question :** limite Vercel de 4,5 Mo par requête → 4 Mo max. Image recollée depuis la page réuploadée (FileHandler) → handlers maison. Raccourcis Enter/Backspace qui écrasaient ceux du bloc d'origine (plus de sortie après 3 Entrée) → relais vers le parent. Images retirées d'une page : restent dans le store (pas de nettoyage).
- **➜ Prochaine action :** tranche Retrouver N1 (recherche par titre).

---

## 12 · 2026-10-21 · ~1h · tranche : Pages N1 éditeur

- **Fait :** sauvegarde auto (1 s après la dernière modification, indicateur d'état, attente avant changement de page, alerte à la fermeture) ; barre d'outils fixe et menu « / » ; checklists (TaskList) ; blocs de code colorés (lowlight) avec sélecteur de langage (node view `CodeBlockView`). Déployé et validé en ligne. Section ajoutée au guide technique.
- **Blocage / question :** la détection auto du langage colore mal le code court → sélecteur ajouté après le premier test. Lien : `prompt` natif en anglais (Nuxt UI), laissé tel quel.
- **➜ Prochaine action :** tranche Pages N1 images (Vercel Blob, captures collées).

---

## 11 · 2026-10-21 · <1h> · tranche : Socle N0 (hébergement, D-006)

- **Fait :** migration vers Vercel + Turso (preset Cloudflare retiré, région `dub1`, variables Turso et auth sur Vercel, migrations appliquées au build). Testé depuis le poste pro : connexion, création et modification d'une page, données retrouvées depuis la maison. D-006 écrite, Socle N0 faite.
- **Blocage / question :** installation globale des CLI refusée en mode auto → faite par l'utilisateur (`!`). Les données D1 n'ont pas été migrées (base Turso partie de zéro).
- **➜ Prochaine action :** reprendre la tranche Pages N1 éditeur (sauvegarde auto, mise en forme, checklists, blocs de code).

---

## 10 · 2026-10-19 · <1h> · tranche : Gestion de projet N0

- **Fait :** sidebar en deux groupes (Projets / Documentation) avec « + » par groupe ; sélecteur de section sur la page ; `section` validée par `POST`/`PATCH` à partir de l'enum du schéma. Déployé et validé en ligne.
- **Blocage / question :** aucun. Les pages existantes sont en Documentation par défaut.
- **➜ Prochaine action :** tranche Pages N1 éditeur (sauvegarde auto, mise en forme, checklists, blocs de code) ; toujours en attente du retour IT pour D-006.

---

## 9 · 2026-10-19 · <1h> · tranche : Retrouver N0

- **Fait :** layout `default` en `UDashboardGroup` : sidebar (nouvelle page, liste des pages triée par dernière modification, déconnexion), repliable et en tiroir sur mobile ; accueil en état vide ; `/login` sans layout. Liste partagée par clé `useFetch` + `refreshNuxtData`. Déployé et validé en ligne.
- **Blocage / question :** aucun.
- **➜ Prochaine action :** tranche Gestion de projet N0 (sections Projets / Doc) ; toujours en attente du retour IT pour D-006.

---

## 8 · 2026-10-19 · <1h> · tranche : Pages N0

- **Fait :** API `GET/PATCH/DELETE /api/pages/:pageId` ; page `/pages/:pageId` (titre + `UEditor` sans toolbar, JSON TipTap, enregistrement manuel, suppression avec confirmation) ; accueil : création → ouverture de la page. Déployé et validé en ligne.
- **Blocage / question :** aucun. À noter : rien ne prévient d'une sortie sans enregistrer (sauvegarde auto au N1) ; 404 = page d'erreur Nuxt par défaut.
- **➜ Prochaine action :** tranche Retrouver N0 (liste des pages dans la sidebar) ; toujours en attente du retour IT pour D-006.

---

## 7 · 2026-10-19 · <1h> · tranche : Accès N0

- **Fait :** auth par mot de passe unique (nuxt-auth-utils) : `/login`, `POST /api/login`, déconnexion, middlewares client et serveur (401 sur `/api/**`). Hash via `pnpm hash-password`. Déployé et validé en ligne. Section auth ajoutée au guide technique.
- **Blocage / question :** secrets wrangler envoyés via `!` enregistrés vides (500 `Empty password`) → renvoyés par stdin. Login derrière le proxy non testable avant D-006.
- **➜ Prochaine action :** tranche Pages N0 (créer / écrire / supprimer) ; toujours en attente du retour IT pour D-006.

---

## 6 · 2026-10-18 · <1h> · tranche : Socle technique N0

- **Fait :** Nuxt 4 + Nuxt UI + NuxtHub initialisé (`src/`) ; recadrage (D-005) : développement délégué à Claude, v1 définie dans la Colonne, méthode figée. ESLint + typecheck ; table `pages` + `GET/POST /api/pages` testés en local ; build Cloudflare (preset `cloudflare_module`, driver D1) OK.
- **Blocage / question :** TypeScript 7 (natif) casse NuxtHub / vue-tsc → épinglé en 5.9.
- **Déployé** sur `wiki-dev.a-antoinecoulon.workers.dev` : écriture D1 OK depuis le poste perso. Le token `CLOUDFLARE_API_TOKEN` du `.bashrc` remplace `wrangler login`.
- **Test poste pro (2026-10-19) : KO.** `wiki-dev.a-antoinecoulon.workers.dev` bloqué par le proxy (« Page web bloquée », catégorie `Liste_noire_URL`) ; le dashboard Cloudflare passe.
- **➜ Prochaine action :**
  - **Au travail (moi) :** demander à l'IT l'autorisation de `wiki-dev.a-antoinecoulon.workers.dev` (et si une app perso pour des notes pro est acceptée) ; tester depuis le poste pro une app `*.vercel.app` et une `*.pages.dev`.
  - Selon le résultat : D-006 (garder workers.dev / domaine perso ~10 €/an / Vercel + Turso ou Neon).
  - **En parallèle (Claude) :** tranche Accès N0, indépendante de l'hébergeur.

---

## 5 · 2026-10-17 · <2h> · tranche : cadrage → Socle technique N0

- **Fait :** décisions D-001 à D-004 (Cloudflare + NuxtHub, Nuxt 4 / Nuxt UI / nuxt-auth-utils, UEditor + JSON TipTap, `space`/`section` sur la page) ; C4 niveaux 1-2 ; tranche Socle N0 écrite ; passage au mode « Claude prépare, je tranche ».
- **Blocage / question :** méthode encore lourde en solo (cf. journal du test) ; D-001 non validée tant que le test depuis le poste pro n'est pas fait.
- **➜ Prochaine action :** initialiser Nuxt 4 + Nuxt UI + NuxtHub et le lancer en local (1er item de la checklist Socle N0).

---

## 4 · 2026-10-16 · <2h> · tranche : cadrage

- **Fait :** Refactorisation (allègement) de la méthode ; premiers écrans (/, /login)
- **Blocage / question :** Méthode trop lourde = refacto
- **➜ Prochaine action :** 
    choix structurants (~1 h) :
      - projet/decisions.md, en commençant par l'hébergement / accès derrière le proxy, puis la stack (Nuxt/UI, DB, auth), l'éditeur et le format du contenu, et le stockage des images ;
      - un C4 rapide (niveaux 1 et 2) dans Excalidraw ;
      - la checklist de Socle technique N0, écrite dans « Tranche en cours ».

---

## 3 · 2026-10-15 · <1h> · tranche : cadrage

- **Fait :** Colonne terminée
- **Blocage / question :** 
- **➜ Prochaine action :** Retours colonne, "Ce qui reste à voir" session précédente, début étape écrans

---

## 2 · 2026-10-14 · <1h> · tranche : cadrage

- **Fait :** DoD ; Colonne débutée
- **Blocage / question :** /
- **➜ Prochaine action :** Continuer colonne

---

## 1 · 2026-10-13 · <1h> · tranche : cadrage

- **Fait :** nettoyage du repo et réinitilisation ; fiche projet ;
- **Blocage / question :** /
- **➜ Prochaine action :** DoD

---
