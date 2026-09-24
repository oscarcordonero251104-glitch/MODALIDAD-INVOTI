import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'

const SESSION_DURATION = 8 * 60 * 60 // 8 hours in seconds
const JWT_SECRET_MIN_LENGTH = 32
// Valor que antes venia hardcodeado; se rechaza para que nadie lo siga usando.
const INSECURE_DEFAULT_SECRET = 'inv-oti-secret-key-change-in-production'

// Lee y valida JWT_SECRET. Se llama al arrancar el servidor (src/instrumentation.ts)
// y cada vez que se firma o verifica un token, asi nunca se usa un secreto por defecto.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    throw new Error(
      'JWT_SECRET no esta definido. Configuralo en .env (ver .env.example) antes de iniciar el servidor.'
    )
  }
  if (secret === INSECURE_DEFAULT_SECRET) {
    throw new Error('JWT_SECRET usa el valor por defecto inseguro. Genera uno nuevo (ver .env.example).')
  }
  if (secret.length < JWT_SECRET_MIN_LENGTH) {
    throw new Error(`JWT_SECRET debe tener al menos ${JWT_SECRET_MIN_LENGTH} caracteres.`)
  }
  return secret
}

export interface AuthUser {
  id: string
  usuario: string
  nombre: string
  rol: string
  estado: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, usuario: user.usuario, nombre: user.nombre, rol: user.rol },
    getJwtSecret(),
    { expiresIn: SESSION_DURATION }
  )
}

export async function createSession(userId: string, token: string): Promise<void> {
  await db.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION * 1000),
    },
  })
}

export async function deleteSession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } })
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any
    const session = await db.session.findUnique({ where: { token } })
    if (!session || session.expiresAt < new Date()) {
      return null
    }
    return {
      id: decoded.id,
      usuario: decoded.usuario,
      nombre: decoded.nombre,
      rol: decoded.rol,
      estado: 'activo',
    }
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (user.rol !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Acceso denegado — se requiere rol administrativo' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}
