# 7. Le Maquettage

Le maquettage donne une forme visuelle à ce que l'on construit **avant de le coder**. Un croquis de 10 minutes évite souvent 2 heures de code refait. En solo, l'objectif n'est pas de produire de belles maquettes, mais de **penser l'écran** : ce qu'il contient, ce qu'on peut y faire, où il mène.

---

## Où le maquettage s'intègre dans la méthode

| Élément de la méthode | Apport du maquettage |
|---|---|
| **Colonne** | La **carte des écrans** relie vertèbres et écrans : quels écrans servent quelle vertèbre ? |
| **Niveaux** | Chaque niveau a une **fidélité de maquette** qui lui correspond (voir l'échelle ci-dessous) |
| **Tranche** | Champ *Maquette* optionnel. Le croquis **illustre les critères d'acceptation**, et la liste des états de l'écran alimente la checklist |
| **Rituels** | Avant une tranche qui crée ou change un écran : 10-15 min de croquis |
| **Journal de décisions** | Un choix d'ergonomie important (navigation, disposition) mérite un ADR |
| **IA relecteur** | « Voici mon wireframe : quels états ne sont pas prévus ? » |

## L'échelle de fidélité, alignée sur les niveaux

| Niveau de la vertèbre | Fidélité | Outil | Temps |
|---|---|---|---|
| **0 · Squelette** | **Croquis / breadboard** : texte et flèches, ou boîtes à main levée | Papier, ASCII dans le Markdown | 5-10 min |
| **1 · Utilisable** | **Wireframe basse fidélité** : boîtes grises, vrais libellés, disposition | Excalidraw, papier | 15-30 min |
| **2 · Confortable** | **Maquette** : vrais composants (Nuxt UI), espacements, états | Directement dans le code, ou Penpot | variable |
| **3 · Soigné** | **Interface finale** : couleurs, micro-interactions, accessibilité | Dans le code | variable |

**Règle :** ne pas monter en fidélité plus vite que le niveau de la vertèbre. Soigner la maquette d'une vertèbre au squelette, c'est du polish prématuré.

## Les outils de base

### 1. La carte des écrans

C'est l'équivalent du C4 pour l'interface : la liste des écrans et la façon dont on passe de l'un à l'autre.

```
[Connexion] ──► [Accueil] ──┬──► [Arbre des pages] ──► [Page (lecture/édition)]
                    │       ├──► [Projets] ──► [Projet : Colonne] ──► [Tranche]
                    │       │                        └──► [Journal de session]
                    │       └──► [Ressources]
                    └── switch Perso / Pro (dans le header, sur tous les écrans)
```

Pour chaque écran, on note quelles **vertèbres** il sert. Un écran qui ne sert aucune vertèbre est suspect, tout comme une vertèbre qui n'a aucun écran.

### 2. Le breadboard (Shape Up)

C'est une maquette **uniquement en texte**, pour penser le flux sans se perdre dans le visuel. On ne décrit que trois choses :
- **les lieux**, c'est-à-dire les écrans ou les modales ;
- **les affordances** : ce sur quoi on peut agir (boutons, champs, liens) ;
- **les connexions** : où mène chaque action.

```
Projet : Colonne              Tranche
─────────────────             ─────────────────
grille des tranches ───────►  critères
bouton « + vertèbre »         checklist (cocher)
bouton « reprendre » ──┐      bouton « terminer » ──► DoD à cocher ──► retour Colonne
                       ▼
                  Reprise de session
                  ─────────────────
                  prochaine action
                  bouton « c'est parti »
```

C'est idéal au **niveau 0** : c'est rapide et ça va dans le Markdown de la tranche.

### 3. Le croquis au gros feutre (*fat marker sketch*, Shape Up)

On dessine avec un **gros feutre**, ce qui rend les détails impossibles à dessiner. On ne capture que la **disposition** et les **grandes zones**. On prend une photo, qui va dans `projet/maquettes/`.

### 4. Crazy 8s (pour explorer des alternatives)

Une feuille pliée en 8 cases, **8 variantes d'un même écran en 8 minutes**. On en garde une, ou un mélange. C'est utile quand on hésite sur une disposition, et ça évite de coder la première idée qui vient.

### 5. La liste des états d'un écran

Un écran n'est jamais dans un seul état. Avant de coder, on coche ceux qui s'appliquent. Ils deviennent des critères d'acceptation ou des items de checklist.

- [ ] **Vide** : premier usage, aucune donnée (que voit-on ? un appel à l'action ?)
- [ ] **Chargement**
- [ ] **Erreur** : réseau, serveur, validation
- [ ] **Normal**
- [ ] **Beaucoup de contenu** : liste longue, titre très long, arborescence profonde
- [ ] **Mobile / petite largeur**
- [ ] **Droits** : connecté ou non, espace Perso ou Pro

On peut répartir ces états selon les niveaux : *Normal* au niveau 0, *Vide* et *Erreur* au niveau 1, les autres au niveau 2.

## Le processus type pour une tranche avec un écran

1. Relire les critères d'acceptation de la tranche.
2. Faire un **croquis** ou un breadboard (10 min). Si j'hésite, faire des Crazy 8s.
3. Cocher la **liste des états** concernés, qui enrichit la checklist.
4. (Optionnel) Faire challenger par l'IA : « quels états ou cas n'ai-je pas prévus ? »
5. Coder. Le code devient la maquette de niveau supérieur.
6. Rattacher le croquis à la tranche (lien vers le fichier).

## Les outils

| Outil | Pour | Remarques |
|---|---|---|
| **Papier + photo** | Croquis, Crazy 8s | Le plus rapide, sans friction |
| **ASCII / Markdown** | Breadboards, carte des écrans | Versionné avec le projet, lisible partout |
| **Excalidraw** | Wireframes | Gratuit, open source, style « dessiné à la main », fichiers `.excalidraw` versionnables, extension VS Code, fonctionne hors-ligne |
| **tldraw** | Wireframes | Alternative à Excalidraw |
| **Penpot** | Maquettes plus poussées | Open source, alternative à Figma, auto-hébergeable |
| **Nuxt UI dans le code** | Maquettes réelles (niveau 2+) | Les composants existent déjà, donc prototyper directement est souvent plus rapide |

## Rangement

```
projet/maquettes/
├── carte-ecrans.md              (ou .excalidraw)
├── page-edition.excalidraw
├── colonne-crazy8.jpg
└── …
```

## Plus tard dans wiki-dev

- Un **bloc TipTap « croquis »** qui intègre Excalidraw dans une page. Une tranche pourrait ainsi contenir son wireframe.
- Un **bloc « états de l'écran »**, c'est-à-dire la checklist ci-dessus, insérable dans une tranche.
- Une **carte des écrans** générée à partir des liens « touche : écran X » des tranches.
