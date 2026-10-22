# Colonne : wiki.dev

> ■ faite · ◧ en cours (une seule !) · □ prévue · (vide) pas prévu
> **v1** = périmètre de la version 1 (recadrage du 2026-10-18, D-005)
> Mise à jour : 2026-10-22

## Grille

| Vertèbre | 0 · Squelette | 1 · Utilisable | 2 · Confortable | 3 · Soigné |
|---|---|---|---|---|
| **Socle technique** | ■ **v1** Nuxt + lint + DB + déployé | ■ **v1** Sauvegardes DB | □ Tests (CI lint + typecheck et déploiement continu déjà en place) |  |
| **Accès** | ■ **v1** Je me connecte | □ Testé au travail et sur mobile | □ Session longue + expiration | □ Sécurité renforcée |
| **Pages** | ■ **v1** Créer / écrire / supprimer (texte brut) | ■ **v1** Sauvegarde auto + mise en forme + checklists + code ; images | ■ Citation, tableau | □ Drag & drop des blocs + bouton « + » |
| **Retrouver** | ■ **v1** Liste dans la sidebar | ■ **v1** Recherche par titre | ■ Arborescence (sous-pages, déplacer) | □ Favoris / pages récentes (sidebar) |
| **Gestion de projet** | ■ **v1** Page rangée dans une section (Projets / Doc) | □ Noyau + statut (dogfooding) | □ Briques à la demande + kanban des tranches |  |
| **Documentation** | ↖ inclus dans Gestion de projet N0 | □ Catégories / tags | □ Promotion des TIL | □ Templates de doc |
| **Espaces** |  | ■ Switch Perso / Pro | ■ Déplacer entre espaces (couvert par N1) |  |
| **Mobile** | ■ **v1** Une page lisible | □ Navigation mobile | □ Confort de lecture |  |
| **Personnalisation** | ■ Accueil avec projets récents | □ Disposition de l'accueil | □ Sidebar personnalisable |  |

> **Hors Colonne :** la migration depuis Notion et dev-docs est **manuelle** (copier-coller), ce n'est pas une capacité de l'app. Elle se fait **après Socle N1** (sauvegardes DB).

## Version 1 (ordre des tranches)

1. ■ Socle N0 · Nuxt + lint + DB + déployé, **test proxy** → *validé sur Vercel + Turso (D-006)*
2. ■ Accès N0 · je me connecte → *validé derrière le proxy (D-006)*
3. ■ Pages N0 · créer / écrire / supprimer
4. ■ Retrouver N0 · liste dans la sidebar
5. ■ Gestion de projet N0 · sections Projets / Doc
6. ■ Pages N1 · éditeur : sauvegarde auto, mise en forme, checklists, blocs de code
7. ■ Pages N1 · images (Vercel Blob, captures collées)
8. ■ Retrouver N1 · recherche par titre
9. ■ Mobile N0 · une page lisible
10. ■ Socle N1 · sauvegardes DB (CI seulement si utile) → puis migration manuelle Notion

## Tranche en cours

Aucune. Pages N2, Espaces N1-N2, Retrouver N2 et Personnalisation N0 validées le 2026-10-22 ; correctifs issus des retours à revalider : voir « À tester ».

## À tester

> Tranches livrées sans avoir pu être testées dans l'app réelle (ex. session depuis le téléphone). Cocher puis retirer une fois validé ; si ça échoue, la tranche repasse en cours.

**Correctifs des retours de test** (2026-10-22, Ctrl+Shift+R avant de tester)

- [ ] Tableau : « Ajouter des lignes » / « Ajouter des colonnes » ouvrent un sous-menu 1, 2 ou 3 ; les actions indisponibles sont nettement plus grisées
- [ ] Sidebar repliée : le bouton d'espace est coloré (primaire) et affiche une infobulle au survol
- [ ] Barre du haut : icône nuage (coché = enregistré, nuage = modifié, alerte = échec) ; assez parlante sur smartphone ?
- [ ] Une page avec des sous-pages les liste sous le titre (liens cliquables)
- [ ] Arborescence limitée à 5 niveaux : « Sous-page » grisé au niveau 5 ; le sélecteur « page parente » ne propose que les pages où la branche tient (les pages de test plus profondes restent éditables)
- [ ] Nouvelle page (sidebar, accueil, sous-page) : le titre « Sans titre » est sélectionné, on tape directement le nom

**Notés pour plus tard** (retours de test, non traités)

- Thème : couleurs, contraste du grisé, à voir ensemble (Personnalisation)
- Icône personnalisée par page, visible dans la sidebar (Personnalisation)
- Au-delà de la limite d'arborescence : liens entre pages, groupes / projets (Retrouver)
- 401 prise sur un rechargement depuis le smartphone : revoir les messages d'erreur (page d'erreur brute au lieu d'un retour au login) et mettre en place des logs (Accès N2, Socle)
- Infobulle au toucher sur l'état de sauvegarde, si l'icône nuage ne suffit pas

DoD : voir [dod.md](dod.md)

## Détail des vertèbres

### Socle technique
- **Rôle :** fondations techniques (init, DB, CI, déploiement…)
- **Écrans :** aucun
- **Tranches :**
  - [N0] ■ Projet Nuxt + lint, DB branchée, déployé (une page accessible en ligne)
  - [N1] ■ Sauvegardes de la DB et des images (`pnpm run backup`)
  - [N2] □ Tests automatisés (déjà fait hors tranche le 2026-10-22 : CI lint + typecheck en GitHub Actions, déploiement à chaque push)
  - [N3] pas prévu (monitoring, perfs, stats : peu utile en mono-utilisateur)

### Accès
- **Rôle :** accéder à mes données, de partout, en sécurité
- **Écrans :** `/login`
- **Tranches :**
  - [N0] ■ Je me connecte (mot de passe unique) sur l'app déployée
  - [N1] □ Login, navigation et sauvegarde vérifiés derrière le proxy et en lecture sur smartphone (après Mobile N0)
  - [N2] □ Session longue sur chaque poste, déconnexion, expiration sans perte de saisie
  - [N3] □ Sécurité renforcée (limitation des tentatives, 2FA ou OAuth)

- j'ouvre l'app au travail
- je me connecte

### Pages
- **Rôle :** créer une page et écrire son contenu
- **Écrans :** `/pages/:id`
- **Tranches :**
  - [N0] ■ Créer, écrire (texte brut) et supprimer une page ; sauvegarde manuelle
  - [N1] ■ Sauvegarde automatique + mise en forme (styles, titres, séparateurs) + checklists + blocs de code (C#)
  - [N1] ■ Images (upload Vercel Blob, captures collées dans l'éditeur)
  - [N2] ■ Citations et tableaux
  - [N3] □ Drag & drop des blocs dans une page + bouton « + » à côté de chaque bloc pour en insérer un au-dessus / en dessous (comme Notion ; `UEditorDragHandle` de Nuxt UI couvre les deux)

- je crée une page
- je sauvegarde mes ajouts/modifications
- je modifie une page
- je supprime une page
- je mets en forme le texte
- j'insère une checklist
- j'insère des blocs de code
- je déplace (drag&drop) mes blocs dans une page

### Retrouver
- **Rôle :** retrouver rapidement une page
- **Écrans :** sidebar
- **Tranches :**
  - [N0] ■ Toutes les pages listées dans la sidebar, cliquables
  - [N1] ■ Recherche par titre (palette Ctrl+K)
  - [N2] ■ Arborescence : sous-pages, déplacer une page dans l'arbre de la sidebar (via un sélecteur « page parente », glisser-déposer non retenu), 5 niveaux max
  - [N3] □ Favoris / pages récentes dans la sidebar

- je retrouve une page
- je déplace une page
- j'organise mes pages en hiérarchie

### Gestion de projet
- **Rôle :** suivre mes projets selon la méthode Colonne
- **Écrans :** `/projects`, `/projects/:id`
- **Tranches :**
  - [N0] ■ Une page est rangée dans une section (Projets ou Documentation) et y reste (couvre aussi Documentation N0)
  - [N1] □ Un nouveau projet = une page pré-remplie avec les sections du noyau (fiche, Colonne, DoD, journaux) + un statut (idée / en cours / terminé) → **wiki-dev est suivi dans wiki-dev**
  - [N2] □ Briques à la demande (wireframes, C4, modèle de données…) ajoutables à un projet
  - [N2] □ Vue kanban des tranches d'un projet
  - [N3] pas prévu (suggestions de briques)

- je vois les projets (en cours, terminés, idées)
- je créé un nouveau projet (nouvelle page avec structure de base)
- j'ajoute un kanban au projet
- j'insère des blocs "méthode" au projet

### Documentation
- **Rôle :** voir la documentation
- **Écrans :** `/documentation`, `/documentation/categories`
- **Tranches :**
  - [N0] inclus dans Gestion de projet N0 (même mécanisme de section)
  - [N1] □ Catégories / tags (par techno, par sujet)
  - [N2] □ Promotion d'un TIL de projet en page de doc
  - [N3] □ Templates de page de doc (fiche techno, how-to, référence…)

- je consulte la documentation

### Espaces
- **Rôle :** séparer mes contenus perso et pro
- **Écrans :** switch dans la sidebar
- **Tranches :**
  - [N0] pas de tranche (l'espace en base est une décision de modèle de données → ADR)
  - [N1] ■ Switch Perso / Pro qui filtre pages, projets et doc
  - [N2] ■ Déplacer une page ou un projet d'un espace à l'autre (sélecteur d'espace de la page, livré avec N1)
  - [N3] pas prévu (espaces personnalisés : Perso/Pro suffit)

- je navigue entre les parties pro et perso

### Mobile
- **Rôle :** consulter mes pages depuis mon smartphone (lecture seule)
- **Écrans :** tous, en largeur mobile
- **Tranches :**
  - [N0] ■ Une page s'ouvre et se lit sans zoomer
  - [N1] □ Navigation mobile (sidebar rétractable)
  - [N2] □ Confort de lecture (typo, blocs de code et tableaux qui défilent)
  - [N3] pas prévu (PWA)

- je consulte une page sur mon téléphone

### Personnalisation
- **Rôle :** permettre la personnalisation de mon workspace
- **Écrans :** `/settings`
- **Tranches :**
  - [N0] ■ Page d'accueil avec projets récents
  - [N1] □ Personnalisation de la disposition de la page d'accueil
  - [N2] □ Personnalisation de la sidebar
  - [N3] pas prévu (statistiques)

- je personnalise ma page d'accueil
