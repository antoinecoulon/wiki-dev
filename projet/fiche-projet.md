# Fiche projet : wiki.dev

> 1 page maximum. Relire à chaque retour après une longue pause.

| | |
|---|---|
| **Espace** | perso |
| **Créé le** | 2026-10-13 |
| **Statut** | **cadrage** / en cours / en pause / terminé / abandonné |

## Le problème

> Quel problème je résous ? Qu'est-ce qui ne va pas aujourd'hui ?

J'utilise aujourd'hui Notion pour gérer mes projets, mes documentations et mes ressources de développement, personnels et professionnels.

Wiki.dev vise à remplacer cette solution.

Je n'utilise que très peu de fonctionnalités de Notion, ce sont elles que je souhaite intégrer.

Le principal problème de Notion est qu'il est difficilement utilisable derrière un proxy d'entreprise, je souhaite régler cela avec wiki.dev.

J'ai déjà essayé de créer mon app de documentation, mais j'ai vite arrêter de l'utiliser (création et édition via l'IDE obligatoire et via les pushs sur github -> lourd ; aucun ajout par rapport à Notion à part l'accès qui était rapide et fluide partout).

La partie gesion de projet suivra une méthode que l'on éprouvera au fil de ce projet. Ce projet permettra d'ajuster et de corriger la méthode pour les futurs projets, mais on ne reviendra pas forcément en arrière si on modifie la méthode, le projet doit avancer. Chaque nouveau projet partira avec un template de base reprenant cette méthode, et des blocs supplémentaires seront proposés ou ajoutables selon les besoins.

## Pour qui

> Qui va s'en servir ? Dans quel contexte ? (même si c'est « moi, au travail, derrière un proxy »)

Seulement moi, sur mon poste perso, mon poste professionnel (proxy), ainsi que sur mon smartphone (en lecture seule pour commencer). Prévoir mono-utilisateur.

## L'objectif

<À quoi je reconnaîtrai que le projet a réussi ? 1 à 3 phrases.>

- J'utilise cette application en remplacement de Notion pour le dev perso/pro, avec un accès plus stable sur tous les postes.
- J'éprouve ma méthode (ajustements en cours de route mais pas de retour en arrière dans le projet) et l'utilise/la tient à jour sur mes futurs projets.
- J'ai progressé en gestion de projet, stack entreprise, architecture dev.

**J'utilise wiki.dev en remplacement de Notion et pendant 6 mois au moins à partir de la première version utilisable.**

## Périmètre

**Ce que je fais :**
- Séparation perso/pro (workspaces)
- Gestion de projets (section principale) suivant méthode
- Documentation dev (section)
- Création et gestion de pages, classées, hiérarchisées
- Mise en page et styles de textes, blocs ajoutables (code, citation, tableaux...)
- Migration manuelle d'une partie de l'existant depuis Notion et dev-docs, une fois les sauvegardes DB en place (perso sans tous les anciens projets, ressources périmées, vieille doc / pro: ce qui est toujours utile)
- Réorganisation drag&drop
- Intégration de kanban et checklists
- Personnalisation de l'affichage, de l'organisation, de la page d'accueil (niveaux 0 à 2)

**Ce que je ne fais PAS** (au moins pour l'instant) :
- Ressources et liens (section)
- Création/modification smartphone
- Sortir du domaine du développement (todos persos, maison et famille...)
- Plusieurs comptes/utilisateurs
- Partage en ligne, connexions apps externes et agents
- Intégration d'autres outils (graphiques, diagrammes, tableaux d'issues...)

## Contraintes

> Techniques, d'accès, de temps, d'hébergement…

- Accès possible et fluide derrière proxy d'entreprise.
- Viser le 100% gratuit.

## Objectifs d'apprentissage

- Progresser en architecture logicielle et en gestion de projet (méthode).
- Progresser sur la stack d'entreprise (Nuxt, C#/ABP, GitLab, SQL Server, TypeScript, scripts JS) autant que possible (éviter l'overengineering, si un meilleur choix de tech existe ça reste mieux).

## Temps consacré (*appetite*)

> Combien de temps je suis prêt à y mettre avant de réévaluer ? Ex. : « niveau 0 complet en 6 sessions »

5 sessions d'1h par semaine * 4 semaines * 3 mois (fin décembre 2026)
=> 60 sessions d'1h

**Point de réévaluation :** niveau 0 complet (7 tranches) en **15 sessions**.

## Questions ouvertes

- Une stack fullstack Nuxt me permet-elle de gérer l'entièreté du projet ?
- Le versionning via GitLab est-il mal parti avec ce repo GitHub ?
- Est-ce possible de trouver un hébergement 100% gratuit sans compromis ?
- Pourquoi le proxy d'entreprise ralentit voire empêche les sauvegardes automatiques et chargement de pages sur Notion ? Et comment éviter ça ?

## À la demande

- [x] Wireframes · [x] C4 1-2 · [ ] Modèle de données
