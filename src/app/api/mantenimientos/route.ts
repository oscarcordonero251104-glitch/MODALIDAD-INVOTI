import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const mantenimientos = await db.mantenimiento.findMany({
      include: { equipo: true },
      orderBy: { fechaProgramada: 'desc' },
    })
    return NextResponse.json({ mantenimientos })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('GET /api/mantenimientos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
