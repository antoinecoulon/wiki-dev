# 6. Les Briques

La méthode est composée d'un **noyau** toujours présent et de **briques optionnelles**. Chaque brique a un **déclencheur**, c'est-à-dire un signal concret qui dit qu'elle devient utile. On l'active à ce moment-là, pas avant.

---

## Le noyau (toujours)

| Brique | Contenu | Coût de démarrage |
|---|---|---|
| **Fiche projet** | 1 page : problème, pour qui, objectif, périmètre (fait / ne fait pas), temps consacré | 30 min |
| **Colonne** | Vertèbres × niveaux, avec les tranches | 30 min |
| **DoD** | Les critères de qualité communs à toutes les tranches | 5 min |
| **Journal de session** | Fait · blocage · prochaine action | 2 min par session |
| **Journal de décisions** | ADR légers | 5-10 min par décision |

## Le catalogue des briques optionnelles

| Brique | Activer quand… | Fiche / source |
|---|---|---|
| **Croquis d'écran** | Une tranche crée ou change un écran | [Fiche 7](07-maquettage.md) |
| **Carte des écrans** | L'app a plus de 3 ou 4 écrans, ou je ne sais plus comment on navigue | [Fiche 7](07-maquettage.md) |
| **Wireframes** | Un écran est complexe, ou j'hésite entre plusieurs dispositions | [Fiche 7](07-maquettage.md) |
| **Breadboard** | Je veux réfléchir au flux sans me perdre dans le visuel | [Fiche 7](07-maquettage.md), Shape Up ch. 4 |
| **C4 niveaux 1-2** | Il y a plus d'un « morceau » technique (front + back, services externes) | <https://c4model.com> |
| **C4 niveau 3** | Un conteneur devient flou et je ne sais plus où mettre le code | <https://c4model.com> |
| **Modèle de données** | La persistance dépasse 2 ou 3 tables, ou les relations se compliquent | MCD Merise / diagramme de classes |
| **Questions ouvertes & risques** | Une inconnue pourrait tout remettre en cause | Voir ci-dessous |
| **Glossaire** | J'utilise des termes métier, ou le même mot pour deux choses | DDD, « langage omniprésent » |
| **Parking d'idées** | Des idées me détournent de la tranche en cours | [Fiche 4](04-journaux.md) |
| **Apprentissages (TIL)** | J'apprends des choses que je veux garder | [Fiche 4](04-journaux.md) |
| **Dette technique** | Je me dis « je ferai propre plus tard » plus d'une fois | Liste : quoi, où, pourquoi, coût estimé |
| **Rétro** | Un niveau est fini, ou le projet stagne | [Fiche 5](05-rituels.md) |
| **Now / Next / Later** | La Colonne devient trop grosse pour être lue d'un coup d'œil | Trois listes de tranches |
| **Appetite** (budget temps) | J'ai tendance à ne jamais finir, ou à sur-polir | Shape Up ch. 3 |

### Questions ouvertes & risques (format minimal)

| Question / risque | Impact si ça tourne mal | Comment je lève le doute | Statut |
|---|---|---|---|
| L'app sera-t-elle accessible derrière le proxy du travail ? | Le projet perd son intérêt principal | Tranche d'exploration « accès » | ouverte |

## Désactiver une brique

Si une brique n'est plus remplie depuis plusieurs tranches, soit elle n'est plus utile, soit elle est trop lourde. On l'arrête ou on l'allège, **sans culpabiliser**, et on le note dans le *Journal du test*.

## Plus tard dans wiki-dev

- Le créateur de projet propose le noyau, et laisse cocher les briques.
- Chaque brique renvoie à sa fiche méthode dans la Documentation.
- wiki-dev peut **suggérer** une brique à partir de signaux, par exemple : « 3 ADR concernent la base de données : activer *Modèle de données* ? » ou « 5 tranches touchent des écrans : activer *Carte des écrans* ? ».
