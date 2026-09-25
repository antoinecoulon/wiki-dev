# wiki-dev

App personnelle pour **remplacer Notion** : documentation de dev (perso et pro), ressources et suivi de projets, en un seul endroit accessible. Notion n'est pas toujours accessible (proxy entreprise), ni toujours adapté.

## Stack et structure

- Code dans `src/` : Nuxt 4, Nuxt UI v4, Tailwind 4, Drizzle ORM + SQLite (libsql, NuxtHub), nuxt-auth-utils. pnpm.
- Éditeur de pages prévu : **TipTap**. Table `pages` (arborescence via `parentId`, `content`, `contentText`).
- Modules visés : Suivi de projet, Documentation, Ressources (voire d'autres) ; espaces **Perso / Pro** switchables.
- `methode/` (racine) : la **méthode Colonne** (analyse, conception, suivi), en test sur ce projet. Voir `methode/README.md`.
- `docs/` est ignoré par git (volontairement). Les documents de suivi du projet vont dans `projet/`.

## Comment travailler avec moi

- Je veux **progresser en analyse et conception**, pas suivre des todolists générées par l'IA. **Je produis d'abord, tu critiques ensuite** : pose des questions, pointe les oublis et les incohérences, mais ne rédige pas à ma place la Colonne, les checklists de tranche ou les ADR, sauf si je le demande explicitement.
- Je code seul, sur mon temps libre, pour le plaisir. Je préfère des méthodes **légères et modulaires**. Si quelque chose devient lourd, propose de l'alléger.
- J'aime les checklists et voir l'avancement, mais **rattachés à une carte** (la Colonne), jamais des listes géantes.
- Réponses en **français**.

## Méthode Colonne (résumé)

- **Colonne** = vertèbres fonctionnelles (≈ EPICs) × niveaux communs : 0 squelette/ébauche, 1 utilisable, 2 confortable, 3 soigné. Le niveau 0 est le *walking skeleton*. La vertèbre **Socle technique** porte le travail purement technique.
- **Tranche** = issue verticale : critères d'acceptation + checklist courte écrite par moi + DoD héritée. **Une seule en cours**, 1 à 3 sessions, découpage SPIDR, explorations limitées dans le temps.
- Le fonctionnel (Colonne), le technique (C4) et l'interface (carte des écrans) sont séparés, et reliés par les tranches (« touche »).
- **Noyau** : fiche projet, Colonne, DoD, journal de session (fait / blocage / prochaine action), journal de décisions (ADR légers). **Briques optionnelles** activées par un déclencheur (maquettage, C4, modèle de données, risques, parking, TIL…).
- **Maquettage** : fidélité alignée sur les niveaux (croquis/breadboard → wireframe → maquette → final), liste des états d'un écran avant de coder.
- Rituels déclenchés par des événements (début/fin de session, tranche finie, niveau complet), jamais par un calendrier.

## État (2026-09-25)

- Méthode formalisée dans `methode/`, **pas encore appliquée**. Prochaine étape : suivre le « Démarrage rapide » de `methode/README.md` (fiche projet, DoD, Colonne construite par moi, croquis, ADR rétroactifs), puis la faire challenger.
- Décision la plus structurante encore ouverte : **hébergement / accès** (derrière un proxy).
