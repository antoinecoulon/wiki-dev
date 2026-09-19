// TODO: sauvegarder dans wiki: Gestion d'erreur try/catch

export default defineEventHandler(async (event): Promise<void> => {
  const {password} = await readBody(event)
  
  try {
    // Validations
    if (!password) {
      throw createError({ status: 400, statusText: 'Mot de passe requis' })
    }

    const hashedPassword = useRuntimeConfig().adminPasswordHash

    const isValid = await verifyPassword(hashedPassword, password)
    
    if (!isValid) {
      throw createError({ status: 401, statusText: 'Incorrect' })
    }

    await setUserSession(event, { user: { login: 'admin' } })
  } catch (err) {

    // Si c'est déjà un createError, relance-le
    if (err instanceof H3Error) {
      console.error('Auth error:', err)
      throw err
    }
    
    // Sinon erreur système → 500
    console.error('Server error:', err)
    throw createError({
      status: 500,
      statusText: 'Erreur serveur'
    })
  }
})

/**
 * TODO
 * 
 * **Comment fonctionnent les erreurs en JS/TypeScript :**

Quand tu fais `throw`, tu interromps l'exécution et tu "remontes" l'erreur à travers la pile d'appels jusqu'à trouver un `catch` ou un gestionnaire global.

```typescript
function levelA() {
  throw new Error('Oh non!')  // ← Erreur lancée ici
  console.log('Never executed')
}

function levelB() {
  levelA()  // ← Erreur remonte ici
  console.log('Never executed')
}

function levelC() {
  try {
    levelB()  // ← Erreur remonte ici
  } catch (err) {
    console.log('Attrappée!', err)  // ← Enfin attrapée
  }
}
```

---

**Solution 1 : Sans try-catch (simple)**

```typescript
export default defineEventHandler(async (event) => {
  const { password } = await readBody(event)
  
  if (!password) {
    throw createError({ status: 400, statusText: 'Requis' })
  }
  
  const isValid = await verifyPassword(..., password)
  if (!isValid) {
    throw createError({ status: 401, statusText: 'Incorrect' })
  }
  
  return { success: true }
})
```

**Fonctionnement :**
- Tu lances des erreurs "attendues" (`createError`)
- Nuxt les attrape automatiquement et les envoie au client
- Le client reçoit `{ status: 401, statusText: 'Incorrect' }`

**Quand l'utiliser :**
- Erreurs **prévisibles** : validation, auth, resources manquantes
- Code **simple et lisible** sans boilerplate
- 90% de tes routes

---

**Solution 2 : Avec try-catch (défensive)**

```typescript
export default defineEventHandler(async (event) => {
  try {
    const { password } = await readBody(event)
    
    if (!password) {
      throw createError({ status: 400, statusText: 'Requis' })
    }
    
    const isValid = await verifyPassword(hash, password)  // ← Peut crash
    
    if (!isValid) {
      throw createError({ status: 401, statusText: 'Incorrect' })
    }
    
    return { success: true }
    
  } catch (err) {
    // Erreur attendue (createError) → relance
    if (err instanceof H3Error) {
      throw err
    }
    
    // Erreur système (DB down, crypto fail, etc) → log + 500
    console.error('Fatal:', err)
    throw createError({
      status: 500,
      statusText: 'Erreur serveur'
    })
  }
})
```

**Fonctionnement :**
- Tu catches **toutes** les exceptions
- Tu distingues : erreurs intentionnelles vs accidents système
- Les erreurs intentionnelles remontent, les accidents deviennent 500

**Quand l'utiliser :**
- Appels externes : BDD, APIs, crypto
- Code **fragile** où des choses imprévisibles peuvent échouer
- Tu veux logger les vrais bugs

---

**Exemple : pourquoi ça change tout**

```typescript
// SANS try-catch
const user = await db.users.findOne({ id: 123 })  // ← DB offline
// ❌ Crash non-géré, utilisateur voit erreur confuse

// AVEC try-catch
try {
  const user = await db.users.findOne({ id: 123 })
} catch (err) {
  console.error('DB Error:', err)
  throw createError({ status: 500, statusText: 'DB error' })
}
// ✅ Tu loggues le vrai problème, utilisateur voit message propre
```

---

**Résumé : quand utiliser quoi**

| Cas | Solution |
|-----|----------|
| Validation, auth manquée, 404 | Sans try-catch |
| Appel DB, API externe, crypto | Avec try-catch |
| Mélange (validation + DB) | Avec try-catch |

**Pour ton route d'auth :** tu as du `verifyPassword()` qui peut échouer → **utilise le try-catch**.
 */