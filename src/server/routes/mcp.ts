import { createHash, timingSafeEqual } from 'node:crypto'
import { createMcpHandler } from '@modelcontextprotocol/server'
import { buildMcpServer } from '../mcp/tools'

// Accès Claude (D-008) : hors de /api/, donc hors session ; protégé par un jeton Bearer
// Stateless : une instance de serveur par requête, adapté aux fonctions Vercel
const handler = createMcpHandler(() => buildMcpServer())

// Jeton aléatoire de 32 octets : un SHA-256 suffit (pas de mot de passe à protéger d'une attaque par dictionnaire)
function isValidToken(header: string | undefined, expectedHash: string) {
  const token = header?.match(/^Bearer (.+)$/)?.[1]
  if (!token || !expectedHash) return false
  const hash = createHash('sha256').update(token).digest()
  const expected = Buffer.from(expectedHash, 'hex')
  return hash.length === expected.length && timingSafeEqual(hash, expected)
}

export default defineEventHandler((event) => {
  if (!isValidToken(getHeader(event, 'authorization'), useRuntimeConfig(event).mcpTokenHash)) {
    throw createError({ status: 401, statusText: 'Jeton invalide' })
  }
  return handler.fetch(toWebRequest(event))
})
