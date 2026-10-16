# Méthode Colonne

Cadre léger d'**analyse, conception et suivi** pour un développeur solo qui code sur son temps libre, pour le plaisir, sans que l'organisation devienne une corvée.

> Statut : **en test**, sur le développement de wiki-dev lui-même (depuis le 2026-09-25). Allégée le 2026-10-16 (voir le journal du test).
> À terme, cette méthode deviendra une page du module *Documentation* de wiki-dev, et sera outillée dans le module *Suivi de projet* (pistes : [`projet/integration-methode.md`](../projet/integration-methode.md)).

**Attitude :** on cadre l'essentiel en amont (une « réunion » d'1 à 2 h : fiche, Colonne, choix techniques structurants), puis **le reste se décide au fil du projet**, au moment où on en a besoin. Cadrer ne doit pas prendre plus de 2 sessions.

---

## L'idée en une image

```
  Fiche projet ─── le cap (1 page)
       │
       ▼
  ┌─ COLONNE ─────────────────────────────────────────────┐
  │               Niv.0       Niv.1       Niv.2      Niv.3 │
  │               squelette   utilisable  confortable soigné│
  │  Socle tech.  ■           ◧           □                │  ◄── la carte : où j'en suis
  │  Vertèbre A   ■           □           □          □     │
  │  Vertèbre B   □           □                            │
  └────────────────────────────────────────────────────────┘
       │ chaque case = une ou plusieurs TRANCHES
       ▼
  Tranche ─── critères d'acceptation + checklist courte + DoD   ◄── ce que je fais
       │
       ├── Journal de session (fait · blocage · prochaine action)
       └── Décisions (quelques lignes chacune)
```

## Les principes

1. **Des checklists accrochées à une carte.** Courtes, rattachées à une tranche, elle-même rattachée à la Colonne. L'avancement se lit sur la carte, pas en « 47 tâches sur 120 ».
2. **Produire d'abord, l'IA relit ensuite.** Je fais ma carte, ma checklist ou ma décision, même imparfaite, puis je demande une critique : « Ne réécris pas. Pointe les oublis et incohérences, sous forme de questions. »
3. **Le squelette d'abord, puis des tranches verticales.** Le niveau 0 traverse toutes les couches (UI → API → DB). Chaque tranche livre quelque chose d'utilisable, pas une couche technique (sauf *Socle technique*).
4. **Une seule tranche en cours.** Une idée qui arrive en route : une ligne dans le journal, et on reprend.
5. **Rendre visibles les renoncements.** Case vide dans la Colonne, « ce que je ne fais pas » dans la fiche.
6. **Toujours savoir quoi faire en reprenant.** On s'arrête de préférence quand on sait quoi faire ensuite.
7. **Juste à temps.** Pas de document « au cas où ». Si un outil pèse, on l'allège ou on l'arrête, et on le note dans le journal du test.

## Le noyau

| Document | Contenu | Template |
|---|---|---|
| **Fiche projet** | 1 page : problème, pour qui, objectif, périmètre (fait / ne fait pas), contraintes, temps consacré | [`fiche-projet.md`](templates/fiche-projet.md) |
| **Colonne** | Vertèbres × niveaux, avec les tranches, et la tranche en cours | [`colonne.md`](templates/colonne.md) |
| **DoD** | 4 à 7 critères de qualité communs à toutes les tranches | [`dod.md`](templates/dod.md) |
| **Journal de session** | 3 lignes en fin de session | [`journal-session.md`](templates/journal-session.md) |
| **Décisions** | Un seul fichier, 3 à 5 lignes par décision | [`decisions.md`](templates/decisions.md) |

## La Colonne

- **Vertèbre** = une grande capacité vue par l'utilisateur (≈ EPIC). On les trouve en listant des verbes (« je crée une page », « je retrouve une page »), regroupés en 5 à 9 vertèbres. La vertèbre **Socle technique**, en haut, porte le travail purement technique (init, CI, déploiement).
- **Niveaux**, communs à tous les projets :

| Niveau | La vertèbre est à ce niveau quand… |
|---|---|
| **0 · Squelette** | Elle existe et traverse toutes les couches. Chemin nominal, moche, ça suffit. |
| **1 · Utilisable** | Je m'en sers pour de vrai. Erreurs principales gérées, pas de perte de données. |
| **2 · Confortable** | C'est agréable : cas limites, ergonomie, rapidité. |
| **3 · Soigné** | Finitions : accessibilité, perfs, polish. |

- **Règles :** compléter le niveau 0 avant d'aller plus loin (règle souple) ; une case vide est un choix ; une case peut contenir plusieurs tranches ; la Colonne bouge au fil du projet.
- **Symboles :** ■ faite · ◧ en cours · □ prévue · *(vide)* pas prévu.

## Les tranches

Pas de fichier dédié : la tranche en cours s'écrit dans la section **« Tranche en cours »** de la Colonne (ou dans une issue).

- **Critères d'acceptation** (*quoi*) : ce que je peux faire à la fin.
- **Checklist** (*comment*), **écrite par moi** : 3 à 7 verbes, l'item le plus incertain en premier. Elle peut changer en route.
- **DoD** (*quelle qualité*) : héritée du projet.
- **Taille : 1 à 3 sessions.** Trop gros ? Couper par chemin utilisateur, par support (desktop puis mobile), par sous-ensemble de données, ou sortir l'inconnu dans une **exploration** limitée dans le temps, dont le livrable est une décision.
- Une fois faite : case à ■, on vide la section, on choisit la suivante.

## Décisions

Une décision = quelques lignes dans `decisions.md` : **contexte, choix, pourquoi** (+ conséquences si elles créent du travail → tranche dans la Colonne). On en écrit une quand on hésite plus de 10 minutes, ou qu'on se dira « pourquoi j'ai fait ça ? » dans 6 mois. On ne supprime pas une décision : on écrit celle qui la remplace.

## Journal de session

- **Début (30 s) :** relire la dernière entrée, surtout la prochaine action.
- **Fin (2 min) :** fait · blocage / question · **prochaine action** (concrète : « brancher la sauvegarde sur l'API », pas « continuer l'éditeur »).
- Idée, apprentissage (TIL), dette : une ligne dans l'entrée du jour, si besoin.

## À la demande

Uniquement quand le besoin se présente, sans template :

- **Wireframe** (Excalidraw, `projet/maquettes/`) quand une tranche crée ou change un écran, avec 2 ou 3 lignes d'**états** : vide, erreur, sauvegarde en cours, mobile…
- **C4 niveaux 1-2** (un fichier Excalidraw) une fois l'hébergement décidé ; à mettre à jour quand l'architecture change.
- **Modèle de données** quand les relations se compliquent.
- **Mini-rétro** (garder / changer / essayer) quand un niveau est fini ou que le projet stagne.

## Démarrage d'un projet (2 sessions max)

1. **Cadrage (~1 h) :** fiche projet, DoD, Colonne avec le niveau 0 de chaque vertèbre.
2. **Choix structurants (~1 h) :** décisions sur la stack, l'hébergement et le stockage ; C4 rapide ; checklist de la première tranche (en général *Socle technique* N0).
3. Coder.

---

## Journal du test de la méthode

Noter ici ce qui marche, ce qui pèse et ce qui manque. C'est ce qui décidera de ce que wiki-dev outillera.

| Date | Observation | Décision |
|---|---|---|
| 2026-10-13 | Fiche projet: le template n'a que « fait / ne fait pas » | une colonne « plus tard » aurait peut-être évité de tout mettre dans « je fais » |
| 2026-10-15 | Fiche colonne: pratique, workflow apprécié, mais du mal à comprendre | prévoir guide au départ, rempli aujourd'hui en Q/R avec Claude |
| 2026-10-16 | Méthode trop lourde : une session entière par petit bout d'étape, estimations de durée fausses (cadrage prévu en 2 sessions, 4 sessions sans avoir fini). Le template écran seul représentait ~3 sessions. Même une équipe ne met pas autant d'effort en conception. | Méthode allégée : on garde fiche, Colonne, DoD, journal ; décisions dans un seul fichier ; tranche écrite dans la Colonne ; wireframes Excalidraw et C4 1-2 à la demande ; suppression des fiches 01-07, de la carte des écrans, du breadboard, des Crazy 8s et des templates écran / tranche / ADR / parking / rétro. Cadrage limité à 2 sessions. |

---

## Références

| Concept | Source |
|---|---|
| User Story Mapping (la Colonne en est une variante tournée de 90°) | Jeff Patton, *User Story Mapping* (O'Reilly, 2014) |
| Walking skeleton | Alistair Cockburn, *Crystal Clear* |
| Modèle C4 | Simon Brown : <https://c4model.com> |
| ADR | Michael Nygard, « Documenting Architecture Decisions » : <https://adr.github.io> |
| Découpage de stories (SPIDR) | Mike Cohn, Mountain Goat Software |
| Shape Up (appetite) | Basecamp : <https://basecamp.com/shapeup> |
