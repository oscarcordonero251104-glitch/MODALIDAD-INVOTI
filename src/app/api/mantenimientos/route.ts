import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/auth'

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

export async function POST(request: Request) {
  try {
    requireAdmin(request)
    const body = await request.json()
    const { equipoId, tipo, descripcion, fechaProgramada, fechaEjecucion, tecnico, estado, costo } = body

    if (!equipoId || !tipo || !descripcion || !fechaProgramada || !tecnico) {
      return NextResponse.json({ error: 'Equipo, tipo, descripción, fecha programada y técnico son obligatorios' }, { status: 400 })
    }

    const equipo = await db.equipo.findUnique({ where: { id: equipoId } })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    const mantenimiento = await db.mantenimiento.create({
      data: {
        equipoId, tipo, descripcion, fechaProgramada,
        fechaEjecucion: fechaEjecucion || null,
        tecnico,
        estado: estado || 'Pendiente',
        costo: costo || 0,
      },
      include: { equipo: true },
    })
    return NextResponse.json({ mantenimiento })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('POST /api/mantenimientos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
