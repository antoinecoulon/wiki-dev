// Usage : pnpm hash-password <mot de passe>
// Même lib que nuxt-auth-utils, donc hash compatible avec verifyPassword
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'

const password = process.argv[2]
if (!password) {
  process.stderr.write('Usage : pnpm hash-password <mot de passe>\n')
  process.exit(1)
}

process.stdout.write(`${await new Hash(new Scrypt({})).make(password)}\n`)
