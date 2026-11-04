export type Theme = 'terminal' | 'phosphore' | 'nord' | 'violet'

// Paires d'accents (primaire de l'espace Perso / Pro) ; lagon et ambre sont dans main.css, les autres sont des palettes Tailwind.
// swatch : teintes 400 (primaire du mode sombre), pour l'aperçu du sélecteur
export const themes = [
  { value: 'terminal' as const, label: 'Terminal', perso: 'lagon', pro: 'ambre', swatch: ['#86e1f5', '#fdc359'] },
  { value: 'phosphore' as const, label: 'Phosphore', perso: 'green', pro: 'amber', swatch: ['#4ade80', '#fbbf24'] },
  { value: 'nord' as const, label: 'Nord', perso: 'sky', pro: 'orange', swatch: ['#38bdf8', '#fb923c'] },
  { value: 'violet' as const, label: 'Violet', perso: 'purple', pro: 'pink', swatch: ['#c084fc', '#f472b6'] }
]

// Thème retenu par appareil (cookie lu au rendu serveur : pas de saut de couleur au chargement)
export function useTheme() {
  return useCookie<Theme>('theme', { default: () => 'terminal', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
}
