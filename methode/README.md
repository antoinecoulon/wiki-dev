# Méthode Colonne

Cadre léger d'**analyse, conception et suivi** pour un développeur solo qui code sur son temps libre, pour le plaisir, sans que l'organisation devienne une corvée.

> Statut : **en test**, sur le développement de wiki-dev lui-même (depuis le 2026-09-25).
> À terme, ces fiches deviendront des pages du module *Documentation* de wiki-dev, et la méthode sera outillée dans le module *Suivi de projet*.

---

## L'idée en une image

```
  Fiche projet ─── le cap (1 page)
       │
       ▼
  ┌─ COLONNE ───────────────────────────────────────────────┐
  │               Niv.0        Niv.1       Niv.2      Niv.3  │
  │               squelette    utilisable  confortable soigné│
  │  Socle tech.  ■            ◧           □                 │   ◄── la carte : où j'en suis
  │  Vertèbre A   ■            □           □          □      │
  │  Vertèbre B   ◧            □                             │
  │  Vertèbre C   □            □           □                 │
  └──────────────────────────────────────────────────────────┘
       │ chaque case = une ou plusieurs TRANCHES
       ▼
  Tranche ─── critères d'acceptation + checklist courte + DoD   ◄── ce que je fais
       │
       ├── Journal de session  (fait · blocage · prochaine action)
       ├── Journal de décisions (ADR légers)
       ├── Parking d'idées · Apprentissages (TIL → Documentation)
       └── Maquette (croquis → wireframe → maquette)

  Vues complémentaires :  C4 (comment c'est construit)  ·  Carte des écrans (comment on s'en sert)
```

**Trois vues, trois questions :**

| Vue | Question | Nature |
|---|---|---|
| **Colonne** | Que permet l'app, et où en suis-je ? | Fonctionnelle + avancement |
| **C4** | Comment c'est construit, où est le code ? | Technique |
| **Carte des écrans** | Comment l'utilisateur s'en sert ? | Interface |

Les tranches font le lien : chacune dit quels **éléments C4** et quels **écrans** elle touche.

---

## Les fiches

| # | Fiche | Contenu |
|---|---|---|
| 1 | [Principes](01-principes.md) | Les idées directrices, l'IA en relecteur |
| 2 | [La Colonne](02-colonne.md) | Vertèbres, niveaux, socle technique, lien avec C4 et écrans |
| 3 | [Les Tranches](03-tranches.md) | Anatomie, statuts, règles, découpage (SPIDR), exploration |
| 4 | [Les Journaux](04-journaux.md) | Session, décisions (ADR), parking d'idées, apprentissages |
| 5 | [Les Rituels](05-rituels.md) | Des rituels minuscules déclenchés par des événements |
| 6 | [Les Briques](06-briques.md) | Le noyau et le catalogue des briques optionnelles |
| 7 | [Le Maquettage](07-maquettage.md) | Du croquis au wireframe, carte des écrans, états d'un écran |
| 8 | [Intégration dans wiki-dev](08-integration-wiki-dev.md) | Modèle de données, créateur guidé, écrans |

**Templates** prêts à copier : [`templates/`](templates/)

**Maquette interactive** : ouvrir [`maquette.html`](maquette.html) dans un navigateur (fonctionne hors-ligne).

---

## Démarrage rapide : tester la méthode sur wiki-dev

Prévoir environ **2 sessions**. Ranger les documents du projet dans un dossier `projet/` à la racine du repo (attention : `docs/` est ignoré par git).

### Session 1 : cadrer et cartographier (~1 h 30)

1. **Fiche projet** (30 min) : [`templates/fiche-projet.md`](templates/fiche-projet.md). Insister sur *ce que je ne fais pas* et sur la *question d'accès* (proxy entreprise).
2. **DoD** (5 min) : [`templates/dod.md`](templates/dod.md).
3. **Colonne** (30 min) : [`templates/colonne.md`](templates/colonne.md)
   - lister 5 à 8 vertèbres **fonctionnelles** + la vertèbre *Socle technique* ;
   - écrire la tranche **niveau 0** de chacune ;
   - marquer comme faites les tranches déjà réalisées (init Nuxt, base SQLite/Drizzle, auth login/logout, layout…).
4. **Croquis** (20 min) : carte des écrans + C4 niveaux 1 et 2, à main levée ([fiche 7](07-maquettage.md)).
5. **Fin de session** : première entrée du [journal de session](templates/journal-session.md).

### Session 2 : décider et démarrer (~1 h)

6. **ADR rétroactifs** (20 min), un par décision déjà prise ou à prendre :
   - Nuxt 4 + Nuxt UI ;
   - SQLite + Drizzle (+ NuxtHub) ;
   - authentification avec nuxt-auth-utils ;
   - éditeur TipTap (à vérifier : Nuxt UI v4 propose peut-être un composant éditeur basé sur TipTap) ;
   - stockage du contenu des pages (JSON TipTap ? Markdown ?) ;
   - **hébergement / accès** (local, auto-hébergé, hors-ligne ?) : c'est la décision la plus structurante.
7. **Faire challenger** la Colonne et les ADR par l'IA, avec les prompts de la [fiche 1](01-principes.md#2-produire-dabord-lia-relit-ensuite).
8. **Choisir la première tranche**, écrire soi-même sa checklist, et coder.
9. **Fin de session** : journal.

---

## Journal du test de la méthode

Noter ici ce qui marche, ce qui pèse et ce qui manque. C'est ce qui décidera de ce que wiki-dev outillera.

| Date | Observation | Décision |
|---|---|---|
| 2026-09-25 | Méthode formalisée, pas encore testée | Tester sur wiki-dev |
|  |  |  |

---

## Références

| Concept | Source |
|---|---|
| User Story Mapping (la Colonne en est une variante tournée de 90°) | Jeff Patton, *User Story Mapping* (O'Reilly, 2014) |
| Walking skeleton | Alistair Cockburn, *Crystal Clear* |
| Modèle C4 | Simon Brown : <https://c4model.com> |
| ADR | Michael Nygard, « Documenting Architecture Decisions » : <https://adr.github.io> |
| SPIDR (découpage de stories) | Mike Cohn, Mountain Goat Software |
| Shape Up (appetite, breadboarding, fat marker sketch) | Basecamp : <https://basecamp.com/shapeup> (gratuit en ligne) |
| Diátaxis (organisation de la documentation) | <https://diataxis.fr> |
| Crazy 8s | Google Design Sprint |
