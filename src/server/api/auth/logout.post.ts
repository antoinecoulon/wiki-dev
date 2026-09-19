export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event)
    return { success: true }
  } catch (err) {
    console.error('Erreur server: ', err)
    throw createError({
      status: 500,
      statusText: 'Erreur serveur'
    })
  }
})