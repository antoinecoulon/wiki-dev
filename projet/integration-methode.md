# Intégration de la méthode dans wiki-dev

Pistes pour **outiller** la méthode dans wiki-dev (vertèbre *Gestion de projet*). On ne construit que ce qui s'est révélé utile pendant le test à la main (voir le *Journal du test* du [README de la méthode](../methode/README.md)).

## Stratégie en 2 temps

1. **Pages + templates** (Gestion de projet N1) : un nouveau projet = une page pré-remplie avec le noyau (fiche, Colonne, DoD, journal de session, décisions) + un statut (idée / en cours / terminé).
2. **Données structurées** (plus tard, si ça se répète) : grille Colonne, tranche en cours, dernière prochaine action. On automatise seulement ce qui se répète.

Principe : **les contenus longs sont des pages** ; ce qui sert à filtrer ou afficher un statut devient une donnée structurée, et seulement quand le besoin apparaît.

## Modèle de données (piste minimale)

```
Projet ─┬─ espace (perso | pro), statut (idée | en cours | terminé)
        └─ pages du noyau (fiche, Colonne, DoD, journal, décisions) + briques à la demande
```

## Écrans (voir la [maquette interactive](../methode/maquette.html))

| Écran | Rôle |
|---|---|
| **Liste des projets** | Par statut (en cours, idées, terminés) |
| **Projet** | Ses pages du noyau ; en tête, la tranche en cours et la dernière prochaine action |

## Plus tard (N2)

- **Briques à la demande** : ajouter à un projet une page wireframes, C4 ou modèle de données.
- **Kanban des tranches.**
- Blocs utiles si le besoin se confirme : « prochaine action », checklist de tranche, croquis Excalidraw.
