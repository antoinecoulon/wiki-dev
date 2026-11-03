// Usage : pnpm mcp-token
// Jeton pour Claude Code (en-tête Authorization: Bearer) et son hash pour NUXT_MCP_TOKEN_HASH
import { createHash, randomBytes } from 'node:crypto'

const token = randomBytes(32).toString('base64url')
process.stdout.write(`Jeton (Claude Code) : ${token}\n`)
process.stdout.write(`NUXT_MCP_TOKEN_HASH : ${createHash('sha256').update(token).digest('hex')}\n`)
