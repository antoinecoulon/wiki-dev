import type { JSONContent } from '@tiptap/core'

// Pages du noyau d'un nouveau projet (méthode Colonne, methode/templates/), en JSON TipTap (D-003)
// Les champs Espace et Statut de la fiche ne sont pas repris : ce sont des données de la page

const text = (value: string, bold = false): JSONContent => ({ type: 'text', text: value, ...(bold && { marks: [{ type: 'bold' }] }) })
const p = (...content: JSONContent[]): JSONContent => ({ type: 'paragraph', content })
const h = (level: number, value: string): JSONContent => ({ type: 'heading', attrs: { level }, content: [text(value)] })
const quote = (value: string): JSONContent => ({ type: 'blockquote', content: [p(text(value))] })
const bullets = (...items: JSONContent[][]): JSONContent => ({
  type: 'bulletList',
  content: items.map(content => ({ type: 'listItem', content: [p(...content)] }))
})
const tasks = (...items: string[]): JSONContent => ({
  type: 'taskList',
  content: items.map(value => ({ type: 'taskItem', attrs: { checked: false }, content: [p(text(value))] }))
})
const table = (header: string[], ...rows: string[][]): JSONContent => ({
  type: 'table',
  content: [
    { type: 'tableRow', content: header.map(value => ({ type: 'tableHeader', content: [p(text(value))] })) },
    ...rows.map(row => ({
      type: 'tableRow',
      // Première colonne (vertèbre) en gras ; une cellule vide garde un paragraphe vide
      content: row.map((value, i) => ({ type: 'tableCell', content: [value ? p(text(value, i === 0)) : { type: 'paragraph' }] }))
    }))
  ]
})
const doc = (...content: JSONContent[]): JSONContent => ({ type: 'doc', content })

export function projectTemplate(date: string) {
  return {
    fiche: doc(
      quote('1 page maximum. Relire à chaque retour après une longue pause.'),
      h(2, 'Le problème'),
      p(text('Quel problème je résous ? Qu\'est-ce qui ne va pas aujourd\'hui ?')),
      h(2, 'Pour qui'),
      p(text('Qui va s\'en servir ? Dans quel contexte ?')),
      h(2, 'L\'objectif'),
      p(text('À quoi je reconnaîtrai que le projet a réussi ? 1 à 3 phrases.')),
      h(2, 'Périmètre'),
      p(text('Ce que je fais :', true)),
      bullets([text('…')]),
      p(text('Ce que je ne fais PAS', true), text(' (au moins pour l\'instant) :')),
      bullets([text('…')]),
      h(2, 'Contraintes'),
      p(text('Techniques, d\'accès, de temps, d\'hébergement…')),
      h(2, 'Temps consacré (appetite)'),
      p(text('Combien de temps je suis prêt à y mettre avant de réévaluer ? Ex. : « niveau 0 complet en 6 sessions »')),
      h(2, 'Questions ouvertes'),
      bullets([text('…')])
    ),
    children: [
      {
        title: 'Colonne',
        content: doc(
          quote('■ faite · ◧ en cours (une seule !) · □ prévue · (vide) pas prévu'),
          h(2, 'Grille'),
          table(
            ['Vertèbre', '0 · Squelette', '1 · Utilisable', '2 · Confortable', '3 · Soigné'],
            ['Socle technique', '□ …', '□ …', '', ''],
            ['Vertèbre 1', '□ …', '□ …', '', ''],
            ['Vertèbre 2', '□ …', '', '', '']
          ),
          h(2, 'Tranche en cours'),
          p(text('Vertèbre · N0 · titre', true)),
          p(text('Terminée quand :')),
          bullets([text('…')]),
          p(text('Checklist (3 à 7 verbes, le plus incertain en premier) :')),
          tasks('…'),
          h(2, 'Détail des vertèbres'),
          h(3, 'Socle technique'),
          bullets(
            [text('Rôle :', true), text(' fondations techniques (init, DB, CI, déploiement…)')],
            [text('Tranches :', true), text(' [N0] □ …')]
          ),
          h(3, 'Vertèbre 1'),
          bullets(
            [text('Rôle :', true), text(' ce que l\'utilisateur peut faire')],
            [text('Écrans :', true), text(' …')],
            [text('Tranches :', true), text(' [N0] □ … · [N1] □ …')]
          )
        )
      },
      {
        title: 'DoD',
        content: doc(
          quote('Les critères de qualité communs à toutes les tranches. Court : 4 à 7 critères. On l\'adapte au fil du projet.'),
          p(text('Une tranche est '), text('faite', true), text(' quand ses critères d\'acceptation sont atteints '), text('et', true), text(' que :')),
          tasks(
            'Ça marche dans l\'app réelle (pas seulement « ça compile »)',
            'Le lint passe',
            'Pas de console.log ni de code mort laissé derrière',
            'La doc est à jour si le comportement a changé',
            'Une décision est écrite si un choix structurant a été fait',
            'Commit(s) propre(s) avec un message clair',
            'Journal de session rempli'
          )
        )
      },
      {
        title: 'Journal de session',
        content: doc(
          quote('Entrées les plus récentes en haut. En début de session, lire la première entrée. En fin de session, 3 champs (2 min). S\'arrêter de préférence quand on sait quoi faire ensuite.'),
          h(2, `${date} · durée · tranche : …`),
          bullets(
            [text('Fait :', true), text(' …')],
            [text('Blocage / question :', true), text(' …')],
            [text('➜ Prochaine action :', true), text(' …')]
          )
        )
      },
      {
        title: 'Décisions',
        content: doc(
          quote('Entrées les plus récentes en haut. 3 à 5 lignes par décision. On ne supprime pas : on écrit la décision qui remplace l\'ancienne.'),
          h(2, `D-001 · ${date} · décision en quelques mots`),
          bullets(
            [text('Contexte :', true), text(' …')],
            [text('Choix :', true), text(' … (options écartées : …)')],
            [text('Pourquoi :', true), text(' …')],
            [text('Conséquences :', true), text(' … (travail à prévoir → tranche dans la Colonne)')]
          )
        )
      }
    ]
  }
}
