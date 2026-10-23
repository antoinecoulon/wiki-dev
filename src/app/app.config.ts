export default defineAppConfig({
  ui: {
    // Palettes définies dans main.css ; primary est basculée selon l'espace (plugin space-color)
    colors: {
      primary: 'lagon',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      info: 'violet',
      neutral: 'terminal'
    },
    // Libellés d'action en majuscules (style terminal) ; les boutons qui affichent un titre de page repassent en normal-case
    button: {
      slots: {
        base: 'uppercase tracking-wide'
      }
    },
    tabs: {
      slots: {
        trigger: 'uppercase tracking-wide'
      }
    },
    // Lien actif de la sidebar : barre à gauche à l'encre de l'espace
    navigationMenu: {
      compoundVariants: [{
        orientation: 'vertical',
        active: true,
        class: {
          link: 'after:absolute after:inset-y-0 after:start-0 after:w-0.5 after:bg-primary'
        }
      }]
    },
    // Actions indisponibles (ex. tableau hors d'un tableau) : opacity-75 par défaut, trop proche de l'état actif
    dropdownMenu: {
      slots: {
        item: 'data-disabled:opacity-40'
      }
    }
  }
})
