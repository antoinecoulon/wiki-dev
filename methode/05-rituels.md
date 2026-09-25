# 5. Les Rituels

Des rituels **minuscules**, déclenchés par des **événements** et non par un calendrier, parce que les sessions de temps libre sont irrégulières.

| Événement | Rituel | Durée |
|---|---|---|
| **Début de session** | Relire la prochaine action et la tranche en cours | 30 s |
| **Fin de session** | Remplir les 3 champs du journal | 2 min |
| **Avant une tranche qui crée ou modifie un écran** | Croquis ou wireframe rapide, avec la liste des états de l'écran | 10-15 min |
| **Décision hésitante (> 10 min)** | Écrire un ADR | 5-10 min |
| **Tranche terminée** | Cocher la DoD, trier le parking, mettre à jour la Colonne, choisir la tranche suivante et la rendre « prête » | 5 min |
| **Niveau complet** (toute une colonne) | Mini-rétro en 3 questions, éventuellement un tag de version | 10 min |
| **Retour après une longue pause** (> 3 semaines) | Relire la fiche projet, la Colonne et les 3 derniers journaux | 5 min |

---

## Détail

### Tranche terminée

1. Les critères d'acceptation sont-ils atteints ? La DoD est-elle cochée ?
2. **Parking** : trier chaque idée (tranche / abandon / reste).
3. **Colonne** : passer la case à ■ si toutes ses tranches sont faites.
4. **Tranche suivante** : la choisir (en général dans le niveau le plus à gauche encore incomplet), puis écrire ses critères d'acceptation et sa checklist.
5. Si des apprentissages le méritent, les promouvoir en Documentation.

### Mini-rétro de fin de niveau

Trois questions seulement :

- **Garder :** qu'est-ce qui a bien marché ?
- **Changer :** qu'est-ce qui a pesé ou coincé ?
- **Essayer :** quelle petite chose je teste au prochain niveau ?

Si la réponse concerne la méthode elle-même, la noter dans le *Journal du test* du [README](README.md).

Template : [`templates/retro.md`](templates/retro.md)
