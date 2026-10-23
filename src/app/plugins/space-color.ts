// Une encre par espace : toute l'interface change de teinte avec l'espace affiché.
// L'app config est clonée par requête côté serveur et la couleur vient du cookie : pas de saut au chargement.
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const space = useSpace()
  watch(space, (value) => {
    appConfig.ui.colors.primary = value === 'pro' ? 'petrole' : 'encre'
  }, { immediate: true })
})
