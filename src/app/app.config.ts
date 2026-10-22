export default defineAppConfig({
  ui: {
    // Actions indisponibles (ex. tableau hors d'un tableau) : opacity-75 par défaut, trop proche de l'état actif
    dropdownMenu: {
      slots: {
        item: 'data-disabled:opacity-40'
      }
    }
  }
})
