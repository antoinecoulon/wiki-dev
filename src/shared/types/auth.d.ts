declare module '#auth-utils' {
  interface UserSession {
    // Dernière prolongation de la session (ms) : sert à l'expiration glissante
    refreshedAt?: number
  }
}

export {}
