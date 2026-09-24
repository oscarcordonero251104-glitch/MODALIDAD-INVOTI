// Next.js ejecuta register() una vez al iniciar el servidor.
// Si JWT_SECRET falta o es inseguro, el servidor no arranca.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getJwtSecret } = await import('./lib/auth')
    try {
      getJwtSecret()
    } catch (error) {
      console.error(`\n❌ ${(error as Error).message}\n`)
      process.exit(1)
    }
  }
}
