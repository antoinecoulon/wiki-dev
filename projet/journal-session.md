# Journal de session : wiki.dev

> Entrées les plus récentes **en haut**. En début de session, lire la première entrée.
> En fin de session, 3 champs (2 min). S'arrêter de préférence quand on sait quoi faire ensuite.

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
