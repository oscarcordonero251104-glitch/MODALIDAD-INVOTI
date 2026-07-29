import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request)
    const { id } = await params
    const body = await request.json()
    const { tipo, titulo, fecha, descripcion, responsable } = body

    if (!tipo || !titulo || !fecha) {
      return NextResponse.json({ error: 'Tipo, título y fecha son obligatorios' }, { status: 400 })
    }

    const equipo = await db.equipo.findUnique({ where: { id } })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    const movimiento = await db.movimiento.create({
      data: {
        equipoId: id,
        tipo,
        titulo,
        fecha,
        descripcion: descripcion || null,
        responsable: responsable || null,
      },
    })

    if ((tipo === 'asignacion' || tipo === 'transferencia') && responsable) {
      await db.equipo.update({
        where: { id },
        data: { responsable },
      })
    }

    return NextResponse.json({ movimiento })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('POST /api/equipos/[id]/movimientos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
