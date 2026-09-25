# 2. La Colonne

La Colonne est **la carte du projet** : ce que l'app permet de faire, et jusqu'où chaque partie est avancée. C'est une variante du *User Story Mapping* de Jeff Patton, tournée de 90° : la colonne vertébrale est verticale, les paliers de maturité sont en colonnes.

---

## Vocabulaire

| Terme | Définition | Équivalent classique |
|---|---|---|
| **Colonne** | La grille vertèbres × niveaux | Story map |
| **Vertèbre** | Une grande capacité du produit, vue par l'utilisateur | EPIC |
| **Niveau** | Un palier de maturité, commun à toutes les vertèbres et à tous les projets | Release / incrément |
| **Tranche** | Un morceau livrable qui fait progresser une vertèbre dans un niveau | Issue / user story |

## Les niveaux (communs à tous les projets)

| Niveau | Nom | Critère : la vertèbre est à ce niveau quand… |
|---|---|---|
| **0** | **Squelette / ébauche** | Elle existe et traverse toutes les couches. Chemin nominal uniquement, c'est moche et ça suffit. |
| **1** | **Utilisable** | Je peux m'en servir pour de vrai. Les erreurs principales sont gérées, les données ne se perdent pas. |
| **2** | **Confortable** | C'est agréable : rapide, raccourcis, cas limites gérés, bonne ergonomie. |
| **3** | **Soigné** | Finitions : accessibilité, performance, détails visuels, polish. |

Les niveaux correspondent aussi à des **niveaux de fidélité des maquettes** (voir la [fiche 7](07-maquettage.md)) : croquis → wireframe → maquette → interface finale.

## Les vertèbres

### Les trouver

- Dérouler le **parcours de l'utilisateur**, avec des verbes : « je me connecte », « j'écris une page », « je range mes pages », « je suis un projet », « je retrouve une ressource ».
- Regrouper ces verbes en **5 à 9 vertèbres**. Moins, la carte est trop grossière. Plus, elle devient illisible, et il vaut mieux regrouper.
- Les **ordonner** selon le parcours ou l'importance : ce qui est en haut est lu et fait en premier.

### Fonctionnel et technique : chacun sa place

- **Les vertèbres sont fonctionnelles** : ce que fait l'app, pas comment elle est construite.
- **La technique vit dans le C4.** Chaque tranche indique les éléments C4 qu'elle *touche*.
- **Le travail purement technique** (initialisation, CI, déploiement, gros refactoring, mise à jour des dépendances) va dans une vertèbre dédiée, **« Socle technique »**, toujours placée **en haut**.

On garde ainsi une seule vue d'avancement, sans mélanger les deux logiques.

## Les règles

1. **Le squelette d'abord.** On complète la colonne *Niveau 0* avant de pousser une vertèbre plus loin. C'est une règle souple : une vertèbre essentielle peut passer au niveau 1 tôt, mais consciemment.
2. **Une case vide est un choix.** Toutes les vertèbres ne vont pas au niveau 3. Les *Ressources* peuvent très bien s'arrêter à *Utilisable*.
3. **Une case peut contenir plusieurs tranches.** Elle est « faite » quand toutes ses tranches le sont.
4. **La Colonne bouge.** On ajoute, fusionne ou supprime des vertèbres quand la compréhension du projet évolue. Si le changement est important, on écrit un ADR.

## Lecture de l'avancement

| Symbole | Sens |
|---|---|
| ■ | faite |
| ◧ | en cours (une seule tranche en cours dans tout le projet) |
| □ | prévue |
| *(vide)* | pas prévu (renoncement assumé) |

La grille se remplit de gauche à droite. On voit d'un coup d'œil ce qui est avancé, ce qui est en retard et ce qu'on a choisi de ne pas faire.

## Lien avec les autres vues

```
             COLONNE (quoi)
        vertèbres × niveaux
                 │
             tranches
            ╱          ╲
     « touche »      « touche »
          ╱              ╲
    C4 (comment)    Carte des écrans (usage)
   conteneurs,        écrans, navigation
   composants
```

Pour reprendre une tranche, on sait donc **quel code ouvrir** (grâce au C4) et **quel écran on modifie** (grâce à la carte des écrans).

## Exemple illustratif : wiki-dev

> ⚠️ Ceci n'est qu'une illustration. **Refais la tienne** : l'exercice consiste justement à la construire soi-même.

```
                 Niv.0 squelette      Niv.1 utilisable     Niv.2 confortable    Niv.3 soigné
Socle technique  ■ Nuxt+DB+auth       □ déploiement        □ CI / tests         □
Accès            ■ login local        □ accès hors proxy   □
Éditer pages     □ texte brut         □ TipTap base        □ blocs custom       □
Organiser        □ liste plate        □ arborescence       □ tags / favoris     □
Espaces P/Pro    □ switch en dur      □ switch UI          □
Projets          □ page + statut      □ Colonne            □ journaux           □ briques
Ressources       □ liens              □ catégories
Recherche        □                    □ plein texte        □
```

Template : [`templates/colonne.md`](templates/colonne.md)
