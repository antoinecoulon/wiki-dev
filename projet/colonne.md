# Colonne : wiki.dev

> ■ faite · ◧ en cours (une seule !) · □ prévue · (vide) pas prévu
> Mise à jour : 2026-10-15

## Grille

| Vertèbre | 0 · Squelette | 1 · Utilisable | 2 · Confortable | 3 · Soigné |
|---|---|---|---|---|
| **Socle technique** | □ Nuxt + lint + DB + déployé | □ Sauvegardes DB + CI | □ Tests + automatisation | □ Monitoring, perfs, stats |
| **Accès** | □ Je me connecte | □ Testé au travail et sur mobile | □ Session longue + expiration | □ Sécurité renforcée |
| **Pages** | □ Créer / écrire / supprimer (texte brut) | □ Mise en forme + checklists | □ Blocs de code et images | □ Drag & drop des blocs |
| **Retrouver** | □ Liste dans la sidebar | □ Recherche par titre | □ Arborescence (sous-pages, déplacer) | □ Favoris / pages récentes |
| **Gestion de projet** | □ Page dans la section Projets | □ Noyau + statut (dogfooding) | □ Briques + kanban des tranches | □ Suggestions de briques |
| **Documentation** | □ Section Documentation | □ Catégories / tags | □ Promotion des TIL | □ Templates de doc |
| **Espaces** | □ Un espace implicite | □ Switch Perso / Pro | □ Déplacer entre espaces | □ Espaces personnalisés |
| **Mobile** | □ Une page lisible | □ Navigation mobile | □ Confort de lecture | □ PWA |
| **Personnalisation** | □ Accueil avec projets récents | □ Disposition de l'accueil | □ Sidebar personnalisable | □ Statistiques |

> **Hors Colonne :** la migration depuis Notion et dev-docs est **manuelle** (copier-coller), ce n'est pas une capacité de l'app.

## Tranche en cours

→ [<nom de la tranche>](tranches/…)

## Détail des vertèbres

### Socle technique
- **Rôle :** fondations techniques (init, DB, CI, déploiement…)
- **Écrans :** aucun
- **Tranches :**
  - [N0] □ Projet Nuxt + lint, DB branchée, déployé (une page accessible en ligne)
  - [N1] □ Sauvegardes de la DB + CI (lint, typecheck)
  - [N2] □ Tests automatisés + automatisation (déploiement continu)
  - [N3] □ Monitoring, performances, statistiques

### Accès
- **Rôle :** accéder à mes données, de partout, en sécurité
- **Écrans :** `/login`
- **Tranches :**
  - [N0] □ Je me connecte (mot de passe unique) sur l'app déployée
  - [N1] □ Login, navigation et sauvegarde vérifiés derrière le proxy et en lecture sur smartphone
  - [N2] □ Session longue sur chaque poste, déconnexion, expiration sans perte de saisie
  - [N3] □ Sécurité renforcée (limitation des tentatives, 2FA ou OAuth)

- j'ouvre l'app au travail
- je me connecte

### Pages
- **Rôle :** créer une page et écrire son contenu
- **Écrans :** `/pages/:id`
- **Tranches :**
  - [N0] □ Créer, écrire (texte brut) et supprimer une page ; le contenu est sauvegardé
  - [N1] □ Mise en forme (styles, titres, séparateurs) + checklists
  - [N2] □ Blocs de code et images
  - [N3] □ Drag & drop des blocs dans une page

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
  - [N0] □ Toutes les pages listées dans la sidebar, cliquables
  - [N1] □ Recherche par titre
  - [N2] □ Arborescence : sous-pages, déplacer une page dans l'arbre de la sidebar
  - [N3] □ Favoris / pages récentes

- je retrouve une page
- je déplace une page
- j'organise mes pages en hiérarchie

### Gestion de projet
- **Rôle :** suivre mes projets selon la méthode Colonne
- **Écrans :** `/projects`, `/projects/:id`
- **Tranches :**
  - [N0] □ Un projet = une page rangée dans la section Projets
  - [N1] □ Un nouveau projet = une page pré-remplie avec les sections du noyau (fiche, Colonne, DoD, journaux) + un statut (idée / en cours / terminé) → **wiki-dev est suivi dans wiki-dev**
  - [N2] □ Briques optionnelles ajoutables à la demande
  - [N2] □ Vue kanban des tranches d'un projet
  - [N3] □ Suggestions de briques selon des signaux (fiche 6)

- je vois les projets (en cours, terminés, idées)
- je créé un nouveau projet (nouvelle page avec structure de base)
- j'ajoute un kanban au projet
- j'insère des blocs "méthode" au projet

### Documentation
- **Rôle :** voir la documentation
- **Écrans :** `/documentation`, `/documentation/categories`
- **Tranches :**
  - [N0] □ Une page créée dans la section Documentation y reste rangée
  - [N1] □ Catégories / tags (par techno, par sujet)
  - [N2] □ Promotion d'un TIL de projet en page de doc
  - [N3] □ Templates de page de doc (fiche techno, how-to, référence…)

- je consulte la documentation

### Espaces
- **Rôle :** séparer mes contenus perso et pro
- **Écrans :** switch dans la sidebar
- **Tranches :**
  - [N0] □ Un seul espace implicite (existe en base, pas dans l'UI)
  - [N1] □ Switch Perso / Pro qui filtre pages, projets et doc
  - [N2] □ Déplacer une page ou un projet d'un espace à l'autre
  - [N3] □ Créer et renommer des espaces personnalisés

- je navigue entre les parties pro et perso

### Mobile
- **Rôle :** consulter mes pages depuis mon smartphone (lecture seule)
- **Écrans :** tous, en largeur mobile
- **Tranches :**
  - [N0] □ Une page s'ouvre et se lit sans zoomer
  - [N1] □ Navigation mobile (sidebar rétractable)
  - [N2] □ Confort de lecture (typo, blocs de code et tableaux qui défilent)
  - [N3] □ PWA (installable sur l'écran d'accueil)

- je consulte une page sur mon téléphone

### Personnalisation
- **Rôle :** permettre la personnalisation de mon workspace
- **Écrans :** `/settings`
- **Tranches :**
  - [N0] □ Page d'accueil avec projets récents
  - [N1] □ Personnalisation de la disposition de la page d'accueil
  - [N2] □ Personnalisation de la sidebar
  - [N3] □ Statistiques

- je personnalise ma page d'accueil
