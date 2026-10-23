export default defineAppConfig({
  ui: {
    // Palettes définies dans main.css ; primary est basculée selon l'espace (plugin space-color)
    colors: {
      primary: 'encre',
      neutral: 'papier'
    },
    // Actions indisponibles (ex. tableau hors d'un tableau) : opacity-75 par défaut, trop proche de l'état actif
    dropdownMenu: {
      slots: {
        item: 'data-disabled:opacity-40'
      }
    }
  }
})
