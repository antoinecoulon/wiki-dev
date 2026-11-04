// Un accent par espace, pris dans le thème choisi : toute l'interface change de teinte avec l'espace affiché.
// L'app config est clonée par requête côté serveur et la couleur vient des cookies : pas de saut au chargement.
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const space = useSpace()
  const theme = useTheme()
  watch([space, theme], ([spaceValue, themeValue]) => {
    // Cookie inconnu (thème retiré, valeur modifiée à la main) : thème par défaut
    const preset = themes.find(t => t.value === themeValue) ?? themes[0]!
    appConfig.ui.colors.primary = spaceValue === 'pro' ? preset.pro : preset.perso
  }, { immediate: true })
})
