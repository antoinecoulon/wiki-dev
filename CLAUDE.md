# wiki-dev

App personnelle pour **remplacer Notion** : documentation de dev (perso et pro), ressources et suivi de projets, en un seul endroit accessible. Notion n'est pas toujours accessible (proxy entreprise), ni toujours adapté.

## Stack et structure

- Modules visés : Suivi de projet, Documentation, Ressources (voire d'autres) ; espaces **Perso / Pro** switchables.
- `methode/` (racine) : la **méthode Colonne** (analyse, conception, suivi), en test sur ce projet. Voir `methode/README.md`.

## Comment travailler avec moi

- **Mode « Claude prépare, je tranche »** (depuis le 2026-10-17) : pour ce projet perso, tu prépares les éléments de méthode (options argumentées avec recommandation, brouillons de décisions, tranches, schémas) et je décide et valide. Présente les choix sous forme de questions à options (Q/R) quand c'est possible. Je garde la main sur les choix ; tu signales les oublis et incohérences.
- Je code seul, sur mon temps libre, pour le plaisir. Je préfère des méthodes **légères et modulaires**. Si quelque chose devient lourd, propose de l'alléger.
- J'aime les checklists et voir l'avancement, mais **rattachés à une carte** (la Colonne), jamais des listes géantes.
- Réponses en **français**.

## Méthode Colonne (résumé, version allégée du 2026-10-16)

- **Attitude :** cadrer l'essentiel en amont (≈ 1-2 h : fiche, Colonne, choix techniques structurants), puis décider le reste au fil du projet. Cadrage ≤ 2 sessions. Ne jamais proposer de documentation « au cas où ».
- **Noyau :** fiche projet, Colonne, DoD, journal de session (fait / blocage / prochaine action), `decisions.md` (un seul fichier, 3-5 lignes par décision).
- **Colonne** = vertèbres fonctionnelles (≈ EPICs) × niveaux : 0 squelette, 1 utilisable, 2 confortable, 3 soigné. La vertèbre **Socle technique** porte le travail purement technique.
- **Tranche** : écrite dans la section « Tranche en cours » de la Colonne (critères + checklist de 3-7 verbes + DoD). **Une seule en cours**, 1 à 3 sessions.
- **À la demande, sans template :** wireframes Excalidraw (+ 2-3 lignes d'états) quand une tranche touche un écran, C4 niveaux 1-2, modèle de données.

## État (2026-10-17)

- Cadrage terminé : `projet/` (fiche, Colonne, DoD, journal, `decisions.md` D-001 à D-004, `architecture.excalidraw` C4 1-2, `screens.excalidraw`).
- Stack décidée : Nuxt 4 + Nuxt UI v4 + NuxtHub sur Cloudflare (Workers, D1/Drizzle, R2), auth nuxt-auth-utils, éditeur UEditor en JSON TipTap.
- Tranche en cours : *Socle technique N0* (voir Colonne). D-001 reste à valider par le test depuis le poste pro.
