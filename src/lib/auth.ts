import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'inv-oti-secret-key-change-in-production'
const SESSION_DURATION = 8 * 60 * 60 // 8 hours in seconds

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
    JWT_SECRET,
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
    const decoded = jwt.verify(token, JWT_SECRET) as any
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
