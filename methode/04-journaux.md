# 4. Les Journaux

Les journaux sont **la mémoire du projet**. Ils sont rattachés au projet, et chaque entrée pointe si possible vers une tranche, une vertèbre ou un élément C4.

| Journal | Répond à | Statut |
|---|---|---|
| **Session** | Où j'en suis ? Que faire en reprenant ? | Noyau |
| **Décisions** (ADR) | Pourquoi c'est fait comme ça ? | Noyau |
| **Parking d'idées** | Qu'est-ce que je ne dois pas oublier sans m'y disperser ? | Brique |
| **Apprentissages** (TIL) | Qu'ai-je appris qui mérite d'être gardé ? | Brique |

---

## Journal de session

C'est le plus important quand on a peu de temps libre : il fait passer la reprise de 20 minutes à 2 minutes.

### Au démarrage (30 secondes)

Relire la dernière entrée, surtout la **prochaine action**.

> *La dernière fois (il y a 9 jours), sur « Créer et afficher une page TipTap », tu t'es arrêté ici : …*
> *Prochaine action : **brancher la sauvegarde sur `PUT /pages/:id`**.*

### En fin de session (2 minutes) : 3 champs

1. **Fait** : ce que j'ai fait.
2. **Blocage / question** (optionnel) : ce qui coince, ce que je me demande.
3. **Prochaine action** : la **toute première chose concrète** à faire la prochaine fois. Pas « continuer l'éditeur », mais « brancher la sauvegarde sur l'API ».

Options : durée, énergie ou humeur (pour repérer ses bons créneaux), tranche liée.

> **Astuce (attribuée à Hemingway) :** s'arrêter *quand on sait exactement quoi faire ensuite*, pas quand on est bloqué. La reprise devient alors facile.

## Journal de décisions (ADR légers)

Un ADR (*Architecture Decision Record*) est un petit document par décision.

```
ADR-003 — Stocker les pages en JSON TipTap          [acceptée · 2026-09-14]
Contexte    : …
Options     : JSON TipTap / Markdown / HTML
Choix       : JSON TipTap
Parce que   : …
Conséquences: export Markdown à prévoir ; recherche plein texte à gérer
Liens       : vertèbre Éditer pages · C4 : DB
```

- **Quand en écrire un :** dès qu'on hésite plus de 10 minutes, ou qu'on se dit « je me demanderai pourquoi dans 6 mois ».
- **Pas seulement pour la technique :** choix de périmètre, abandon d'une vertèbre, changement de méthode, choix d'ergonomie.
- **Statuts :** proposée → acceptée → remplacée par ADR-xxx (ou rejetée). On ne supprime jamais un ADR, on le remplace, et l'historique reste lisible.
- **Les conséquences créent du travail.** Une conséquence comme « export Markdown à prévoir » devient une tranche *idée* dans la Colonne.
- **Une exploration aboutit à un ADR.** Le livrable d'une tranche d'exploration est une décision.

Numérotation : `ADR-001`, `ADR-002`… Un fichier par ADR : `projet/decisions/ADR-001-titre-court.md`.

## Parking d'idées

C'est l'antidote à l'extension du périmètre et à l'éparpillement.

- Une idée arrive en pleine session ? On la note **en une ligne** et on reprend la tranche en cours.
- On **trie** le parking à chaque tranche terminée. Chaque idée devient :
  - une **tranche** (idée ou prête) dans la Colonne ;
  - un **abandon** (on garde une trace) ;
  - ou elle **reste au parking**.

## Apprentissages (TIL, *Today I Learned*)

Ce qu'on apprend en codant : une astuce Nuxt, un piège Drizzle, une commande utile…

- Une ou deux lignes, avec un lien si possible.
- Les meilleurs sont **promus en page du module Documentation** de wiki-dev. Les projets alimentent ainsi la documentation, et c'est là que les modules se relient entre eux.

Templates : [`journal-session.md`](templates/journal-session.md) · [`adr.md`](templates/adr.md) · [`parking.md`](templates/parking.md)
