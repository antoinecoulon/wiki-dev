# 1. Principes

Les idées directrices de la méthode. Si une règle d'une autre fiche entre en conflit avec ces principes, ce sont les principes qui gagnent.

---

## 1. Des checklists accrochées à une carte

Une checklist n'est pas un problème, mais **une checklist sans carte** en est un :
- elle **remplace la réflexion** au lieu d'en découler, donc on la suit sans la comprendre ;
- elle est **linéaire** : au point 23, on ne sait plus comment il se rattache à l'ensemble.

La méthode garde les checklists, mais **courtes et rattachées à un plan** :

```
Carte (Colonne)   →   un morceau (Tranche)   →   checklist courte de CE morceau
 « où je suis »        « ce que je fais »          « comment je le fais »
```

L'avancement se lit **sur la carte**, pas en « 47 tâches sur 120 ».

## 2. Produire d'abord, l'IA relit ensuite

C'est le changement qui fait le plus progresser. Je fais ma carte, mon découpage ou ma décision, même imparfaits. Ensuite seulement, je demande une critique. L'IA sert de **relecteur**, pas de générateur.

Prompts types :

- **Colonne :** « Voici ma Colonne. Ne la réécris pas. Liste les vertèbres probablement manquantes, les tranches trop grosses et les incohérences, avec une question pour chacune. »
- **Checklist de tranche :** « Voici ma checklist pour la tranche X. Qu'est-ce que j'oublie ? Réponds uniquement par des questions. »
- **ADR :** « Voici mon ADR. Joue l'avocat du diable contre l'option retenue. Quelles conséquences n'ai-je pas vues ? »
- **Maquette :** « Voici mon wireframe. Quels états de l'écran ne sont pas prévus (vide, erreur, contenu très long, mobile) ? »
- **Fiche projet :** « Voici ma fiche projet. Qu'est-ce qui est flou ? Où le périmètre risque-t-il de déraper ? »

Objectif à terme : ne plus avoir besoin de poser ces questions, parce qu'on se les pose soi-même.

## 3. Un noyau minimal, des briques à la demande

- **Le noyau**, toujours présent et léger : fiche projet, Colonne, DoD, journal de session, journal de décisions.
- **Les briques**, optionnelles et activées par un **déclencheur** concret : C4, modèle de données, maquettage, risques, glossaire, etc. Voir la [fiche 6](06-briques.md).

Si une brique n'est pas utile, on ne l'active pas. Si elle ne sert plus, on l'arrête. Mieux vaut une méthode suivie à 80 % qu'une méthode complète abandonnée.

## 4. Le squelette d'abord, puis des tranches verticales

- **Squelette qui marche** : une version minuscule qui traverse toutes les couches (interface → API → base de données). C'est le niveau 0 de la Colonne.
- **Tranches verticales** : chaque unité de travail est une fonctionnalité utilisable de bout en bout (« je peux créer une page »), pas une couche technique (« faire le modèle »).

## 5. Une seule chose à la fois

**Une seule tranche en cours.** C'est la règle la plus utile en solo, car l'éparpillement tue les projets perso. Une idée qui arrive en cours de route va dans le **parking**.

## 6. Des rituels déclenchés par les événements, pas par le calendrier

Les sessions sont irrégulières, donc on n'impose pas de « revue hebdomadaire ». Chaque rituel est déclenché par un événement : début ou fin de session, tranche terminée, niveau complet. Voir la [fiche 5](05-rituels.md).

## 7. Rendre visibles les renoncements

Une case vide dans la Colonne, une ligne « ce que je ne fais pas » dans la fiche projet, une idée laissée au parking : **décider de ne pas faire** fait partie de la conception.

## 8. Toujours savoir quoi faire en reprenant

Avec peu de temps libre, le coût de la reprise est l'ennemi. Chaque session se termine par une **prochaine action** concrète, et on s'arrête de préférence *quand on sait quoi faire ensuite*, pas quand on est bloqué.

## 9. La méthode évolue

Elle est en test. Ce qui pèse est allégé, ce qui manque est ajouté. Tout est noté dans le *Journal du test* du [README](README.md#journal-du-test-de-la-méthode).
