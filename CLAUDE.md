# wiki-dev

App personnelle pour **remplacer Notion** : documentation de dev (perso et pro), ressources et suivi de projets, en un seul endroit accessible. Notion n'est pas toujours accessible (proxy entreprise), ni toujours adapté.

## Stack et structure

- Modules visés : Suivi de projet, Documentation, Ressources (voire d'autres) ; espaces **Perso / Pro** switchables.
- `methode/` (racine) : la **méthode Colonne** (analyse, conception, suivi), en test sur ce projet. Voir `methode/README.md`.

## Comment travailler avec moi

- Je veux **progresser en analyse et conception**, pas suivre des todolists générées par l'IA. **Je produis d'abord, tu critiques ensuite** : pose des questions, pointe les oublis et les incohérences, mais ne rédige pas à ma place la Colonne, les checklists de tranche ou les ADR, sauf si je le demande explicitement.
- Je code seul, sur mon temps libre, pour le plaisir. Je préfère des méthodes **légères et modulaires**. Si quelque chose devient lourd, propose de l'alléger.
- J'aime les checklists et voir l'avancement, mais **rattachés à une carte** (la Colonne), jamais des listes géantes.
- Réponses en **français**.

## Méthode Colonne (résumé, version allégée du 2026-10-16)

- **Attitude :** cadrer l'essentiel en amont (≈ 1-2 h : fiche, Colonne, choix techniques structurants), puis décider le reste au fil du projet. Cadrage ≤ 2 sessions. Ne jamais proposer de documentation « au cas où ».
- **Noyau :** fiche projet, Colonne, DoD, journal de session (fait / blocage / prochaine action), `decisions.md` (un seul fichier, 3-5 lignes par décision).
- **Colonne** = vertèbres fonctionnelles (≈ EPICs) × niveaux : 0 squelette, 1 utilisable, 2 confortable, 3 soigné. La vertèbre **Socle technique** porte le travail purement technique.
- **Tranche** : écrite dans la section « Tranche en cours » de la Colonne (critères + checklist de 3-7 verbes écrite par moi + DoD). **Une seule en cours**, 1 à 3 sessions.
- **À la demande, sans template :** wireframes Excalidraw (+ 2-3 lignes d'états) quand une tranche touche un écran, C4 niveaux 1-2, modèle de données.

## État (2026-10-16)

- Cadrage fait : `projet/` (fiche, Colonne, DoD, journal). Méthode allégée (voir journal du test dans `methode/README.md`).
- Prochaine étape : `projet/decisions.md` (hébergement / accès derrière le proxy, stack, éditeur et format du contenu, stockage des images), C4 rapide, checklist de *Socle technique* N0, puis coder.
