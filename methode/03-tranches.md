# 3. Les Tranches

La tranche est **l'unité de travail** : un morceau livrable qui fait progresser une vertèbre d'un niveau, avec sa propre checklist. C'est l'équivalent d'une issue dans un système EPIC / Issues avec DoD.

---

## Anatomie

```
┌ Tranche : « Créer et afficher une page TipTap »     [Éditer pages · Niv. 1]
│ Pourquoi   : pouvoir écrire du contenu riche, base de tout le reste
│ Terminée quand (critères d'acceptation) :
│   - je crée une page, je la ferme, je la retrouve intacte
│   - titres, listes et blocs de code sont supportés
│ Touche     : C4 → UI · API · DB     Écrans → Page (lecture/édition)
│ Maquette   : croquis maquettes/page-edition.png (optionnel)
│ Checklist de réalisation (écrite par moi, 3 à 8 items) :
│   □ …
│ DoD (héritée du projet) :
│   □ marche dans l'app réelle  □ doc à jour  □ ADR si décision  □ journal rempli
│ Liens      : ADR-003 · sessions du 12/09, 14/09
└ Statut : idée → prête → en cours → faite
```

Il y a trois listes distinctes, à ne pas mélanger :

| Liste | Répond à | Propre à |
|---|---|---|
| **Critères d'acceptation** | *Quoi* : que doit-on pouvoir faire à la fin ? | la tranche |
| **Checklist de réalisation** | *Comment* : par quelles étapes j'y arrive ? | la tranche, **écrite par moi** |
| **DoD** (Definition of Done) | *Quelle qualité* : quels standards je respecte toujours ? | le projet, héritée par toutes les tranches |

## Statuts

```
idée ──► prête ──► en cours ──► faite
  │                    │
  └──► abandonnée ◄────┘
```

- **Idée** : notée, pas encore réfléchie (souvent issue du parking).
- **Prête** : je sais répondre à deux questions : *qu'est-ce que je fais ?* et *comment saurai-je que c'est fini ?* C'est une DoR (Definition of Ready) réduite au minimum.
- **En cours** : **une seule à la fois** dans tout le projet.
- **Faite** : critères d'acceptation atteints **et** DoD cochée.
- **Abandonnée** : on garde une trace, avec une ligne pour expliquer pourquoi.

## Les règles

1. **Une seule tranche en cours.**
2. **Taille : 1 à 3 sessions.** Au-delà, on découpe.
3. **Verticale** : une tranche livre quelque chose d'utilisable ou de vérifiable, pas une couche technique isolée. La vertèbre *Socle technique* est l'exception.
4. **La checklist de réalisation est écrite par moi**, avec 3 à 8 items, chacun formulé par un verbe (« créer la route `PUT /pages/:id` »). Si elle dépasse 8 items, la tranche est probablement trop grosse.
5. **La checklist peut changer en cours de route.** C'est normal : on découvre des choses en codant. On ajoute, on barre, et on ne se sent pas coupable.

## Les trois types de tranches

| Type | Livre | Exemple |
|---|---|---|
| **Fonctionnelle** | Une capacité utilisable | « Créer et afficher une page » |
| **Technique** (vertèbre *Socle*) | Une fondation vérifiable | « Déployer sur mon serveur » |
| **Exploration** (*spike*) | **Une réponse**, souvent un ADR, pas du code | « TipTap ou autre ? 2 sessions max » |

Une tranche d'exploration est **limitée dans le temps dès le départ**. À la fin du temps prévu, on décide avec ce qu'on sait. Le code écrit pendant l'exploration peut être jeté.

## Découper une tranche trop grosse : SPIDR

Cinq manières de couper (Mike Cohn) :

| Lettre | Découper par… | Exemple (Éditer pages) |
|---|---|---|
| **S**pike | Sortir la partie inconnue dans une exploration | « Tester l'intégration TipTap + Nuxt » |
| **P**aths | Un chemin utilisateur à la fois | Créer d'abord, modifier ensuite, supprimer plus tard |
| **I**nterfaces | Une interface ou un support à la fois | Desktop d'abord, mobile plus tard |
| **D**ata | Un sous-ensemble des données d'abord | Texte seul, puis titres, puis images |
| **R**ules | Les règles métier plus tard | Pas de validation ni de limite de taille au début |

## Écrire une bonne checklist de réalisation

- Commencer par **relire les critères d'acceptation** et la **maquette** s'il y en a une.
- Regarder le **C4** : quelles couches je touche ? En général, il faut au moins un item par couche.
- Formuler **des actions** vérifiables (« afficher la liste des pages »), pas des thèmes (« le front »).
- Mettre en premier l'item qui **lève le plus d'incertitude**.
- Faire challenger la checklist, *une fois qu'elle est écrite*, avec le prompt de la [fiche 1](01-principes.md).

Template : [`templates/tranche.md`](templates/tranche.md)
