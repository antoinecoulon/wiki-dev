// Usage : pnpm run backup (depuis src/)
// Sauvegarde la base Turso (dump SQL horodaté, 30 derniers gardés) et les images du store Blob
// dans backups/ à la racine du repo (gitignoré). Prérequis : CLI turso connectée, BLOB_READ_WRITE_TOKEN (.env.local).
// Restauration : turso db create <nom>, puis turso db shell <nom> < backups/db/<fichier>.sql
// (--from-dump crée une base vide, sans erreur)
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { get, list } from '@vercel/blob'

const DATABASE = 'wiki-dev'
const KEEP_DUMPS = 30

const dir = join(import.meta.dirname, '../../backups')
const dbDir = join(dir, 'db')
await mkdir(dbDir, { recursive: true })

// Base : un dump incomplet (pas de COMMIT final) ne remplace rien
const { stdout: dump } = await promisify(execFile)('turso', ['db', 'shell', DATABASE, '.dump'], { maxBuffer: 512 * 1024 * 1024 })
if (!dump.trimEnd().endsWith('COMMIT;')) {
  process.stderr.write('Dump incomplet, rien n\'est écrit\n')
  process.exit(1)
}
const stamp = new Date().toISOString().slice(0, 16).replace(':', '-')
const dumpFile = join(dbDir, `${DATABASE}-${stamp}.sql`)
await writeFile(dumpFile, dump)

// Noms horodatés : l'ordre alphabétique est l'ordre chronologique
const dumps = (await readdir(dbDir)).filter(name => name.endsWith('.sql')).sort()
for (const old of dumps.slice(0, -KEEP_DUMPS)) await rm(join(dbDir, old))

// Images : noms uniques jamais réécrits, on ne télécharge que les nouvelles
let downloaded = 0
let cursor
do {
  const page = await list({ prefix: 'images/', cursor })
  for (const blob of page.blobs) {
    const file = join(dir, blob.pathname)
    if (existsSync(file)) continue
    const result = await get(blob.pathname, { access: 'private' })
    if (result?.statusCode !== 200) throw new Error(`Image illisible : ${blob.pathname}`)
    await mkdir(join(dir, 'images'), { recursive: true })
    await writeFile(file, Buffer.from(await new Response(result.stream).arrayBuffer()))
    downloaded++
  }
  cursor = page.cursor
} while (cursor)

process.stdout.write(`Base : ${dumpFile}\nImages : ${downloaded} nouvelle(s)\n`)
