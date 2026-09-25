# 8. Intégration dans wiki-dev

Comment la méthode pourrait être **outillée** dans wiki-dev. Ce ne sont que des pistes : on ne les construit **qu'après** avoir testé la méthode à la main, et seulement pour ce qui s'est révélé utile (voir le *Journal du test* du [README](README.md)).

---

## Stratégie en 3 temps

1. **À la main** : fichiers Markdown dans `projet/` (maintenant, pendant le test).
2. **Pages TipTap** : les mêmes documents deviennent des pages wiki-dev créées depuis des **templates**, avec la souplesse de Notion.
3. **Données structurées et vues calculées** : grille Colonne, reprise de session, suggestions de briques. On automatise seulement ce qui se répète.

## Modèle de données (piste)

```
Projet ─┬─ espace (perso | pro)
        ├─ FicheProjet → Page TipTap
        ├─ DoD[] (critères)
        ├─ BriquesActivées[]
        ├─ Niveaux (communs : 0 squelette, 1 utilisable, 2 confortable, 3 soigné)
        ├─ Vertèbres[] (ordre, estSocleTechnique)
        │     └─ Tranches[] ─┬─ niveau, type (fonctionnelle | technique | exploration)
        │                    ├─ statut (idée | prête | en cours | faite | abandonnée)
        │                    ├─ critères[], checklist[], description → Page TipTap
        │                    ├─ touche → ÉlémentsC4[], Écrans[]
        │                    └─ maquettes[] (fichiers / blocs croquis)
        ├─ ÉlémentsC4[] (optionnel : niveau, type, parent)
        ├─ Écrans[] (optionnel : nom, liens de navigation)
        ├─ Sessions[] (date, durée, fait, blocage, prochaineAction, → Tranche)
        ├─ Décisions[] (numéro, titre, statut, remplacéePar, → Vertèbre/Tranche/ÉlémentC4) → Page TipTap
        ├─ Parking[] (texte, date, devenu → Tranche | abandon)
        └─ Apprentissages[] (texte, lien, promu → Page Documentation)
```

Principe : **les contenus longs sont des pages TipTap** (fiche projet, corps d'un ADR, description d'une tranche). **Tout ce qui sert à filtrer, lier ou afficher un statut est une donnée structurée.**

Remarque : la table `pages` actuelle (avec `parentId` et `content`) peut déjà héberger les contenus longs. Les objets de la méthode la référenceraient.

## Les écrans clés (voir la [maquette interactive](maquette.html))

| Écran | Rôle |
|---|---|
| **Tableau de bord projet** | Colonne en grille + tranche en cours + dernière prochaine action |
| **Reprise de session** | L'écran d'accueil d'un projet quand on revient : « tu en étais là » |
| **Fiche tranche** | Critères, checklist cochable, DoD héritée, liens (ADR, sessions, C4, écrans) |
| **Fin de session** | Formulaire en 3 champs |
| **Journal de décisions** | Liste d'ADR, avec leurs statuts et remplacements |
| **Catalogue de briques** | Activer ou désactiver les briques, avec leur déclencheur et un lien vers la fiche méthode |
| **Créateur de projet guidé** | Voir ci-dessous |

## Le créateur de projet guidé

C'est un assistant en quelques étapes, sans complexité inutile :

1. **Cadrage** : les questions de la fiche projet (problème, pour qui, fait / ne fait pas, temps consacré). Il génère la page *Fiche projet*.
2. **Espace** : perso ou pro.
3. **Briques** : le noyau est pré-coché, et les briques optionnelles sont présentées avec leur déclencheur.
4. **Vertèbres** : saisir 5 à 9 vertèbres (plus le *Socle technique*, ajouté automatiquement), puis, pour chacune, la tranche de niveau 0.
5. **DoD** : partir d'une DoD par défaut et l'adapter.
6. **Résultat** : le tableau de bord du projet, avec la première tranche à rendre « prête ».

L'assistant **pose des questions**, il ne génère pas de todolist. Cohérent avec le [principe 2](01-principes.md).

## Blocs TipTap personnalisés (plus tard)

- **Bloc ADR** : champs structurés et statut.
- **Bloc statut de tranche**, ou lien vers une tranche avec son statut en direct.
- **Bloc « prochaine action »**.
- **Bloc croquis** (Excalidraw).
- **Bloc « états de l'écran »**.
- **Bloc « fiche méthode »** : un lien vers la fiche avec un aperçu.

## Lien avec les autres modules

- **Documentation** : les fiches méthode y vivent, et les apprentissages (TIL) y sont promus.
- **Ressources** : les liens utiles d'un projet (docs de libs, articles) y sont rangés et reliés au projet.
- **Espaces perso / pro** : tous les objets de la méthode appartiennent à un espace.
