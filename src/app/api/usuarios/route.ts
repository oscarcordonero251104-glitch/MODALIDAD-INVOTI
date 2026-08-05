import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    requireAdmin(request)
    const users = await db.user.findMany({
      select: {
        id: true,
        usuario: true,
        nombre: true,
        rol: true,
        estado: true,
        solicitudReset: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ users })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('GET /api/usuarios error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
