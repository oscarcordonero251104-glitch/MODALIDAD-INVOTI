import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { estado, fechaEjecucion, costo, descripcion } = body

    const existing = await db.mantenimiento.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Mantenimiento no encontrado' }, { status: 404 })
    }

    const estadosValidos = ['Pendiente', 'En proceso', 'Completado', 'Cancelado']
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (estado) data.estado = estado
    if (descripcion !== undefined) data.descripcion = descripcion
    if (costo !== undefined) data.costo = Number(costo) || 0
    if (fechaEjecucion !== undefined) {
      data.fechaEjecucion = fechaEjecucion || null
    } else if (estado === 'Completado' && !existing.fechaEjecucion) {
      data.fechaEjecucion = new Date().toISOString().slice(0, 10)
    }

    const mantenimiento = await db.mantenimiento.update({
      where: { id },
      data,
      include: { equipo: true },
    })
    return NextResponse.json({ mantenimiento })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('PATCH /api/mantenimientos/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
