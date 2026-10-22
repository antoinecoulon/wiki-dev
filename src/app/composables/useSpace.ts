export type Space = 'perso' | 'pro'

export const spaces = [
  { value: 'perso' as const, label: 'Perso', icon: 'i-lucide-house' },
  { value: 'pro' as const, label: 'Pro', icon: 'i-lucide-briefcase' }
]

// Espace affiché, retenu par appareil (cookie lu au rendu serveur : pas de saut à l'affichage)
export function useSpace() {
  return useCookie<Space>('space', { default: () => 'perso', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
}
