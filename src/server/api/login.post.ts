export default defineEventHandler(async (event) => {
  const { password } = await readValidatedBody(event, (body) => {
    const password = (body as { password?: unknown })?.password
    if (typeof password !== 'string' || !password) {
      throw createError({ status: 400, statusText: 'Mot de passe requis' })
    }
    return { password }
  })

  const isValid = await verifyPassword(useRuntimeConfig(event).adminPasswordHash, password)
  if (!isValid) {
    throw createError({ status: 401, statusText: 'Mot de passe incorrect' })
  }

  await setUserSession(event, { user: { login: 'admin' }, refreshedAt: Date.now() })
})
