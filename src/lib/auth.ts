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

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
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

export function getAuthUser(request: Request): AuthUser | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(request: Request): AuthUser {
  const user = getAuthUser(request)
  if (!user) {
    throw new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}

export function requireAdmin(request: Request): AuthUser {
  const user = requireAuth(request)
  if (user.rol !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Acceso denegado — se requiere rol administrativo' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}
