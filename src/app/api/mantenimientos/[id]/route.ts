import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const body = await request.json()
    const { estado, fechaEjecucion, costo, descripcion, tipo, fechaProgramada, tecnico } = body

    const existing = await db.mantenimiento.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Mantenimiento no encontrado' }, { status: 404 })
    }

    const estadosValidos = ['Solicitado', 'Pendiente', 'En proceso', 'Completado', 'Cancelado']
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    // Completar una solicitud (fijar tipo/fecha/tecnico asignado) es una accion solo de administrador.
    if (tipo !== undefined || fechaProgramada !== undefined || tecnico !== undefined) {
      if (user.rol !== 'admin') {
        throw new Response(JSON.stringify({ error: 'Acceso denegado — se requiere rol administrativo' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      if (existing.estado === 'Solicitado' && (!tipo || !fechaProgramada || !tecnico)) {
        return NextResponse.json({ error: 'Tipo, fecha programada y técnico son obligatorios para programar la solicitud' }, { status: 400 })
      }
    }

    const data: Record<string, unknown> = {}
    if (estado) data.estado = estado
    if (descripcion !== undefined) data.descripcion = descripcion
    if (tipo !== undefined) data.tipo = tipo
    if (fechaProgramada !== undefined) data.fechaProgramada = fechaProgramada
    if (tecnico !== undefined) data.tecnico = tecnico
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request)
    const { id } = await params
    const existing = await db.mantenimiento.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Mantenimiento no encontrado' }, { status: 404 })
    }
    await db.mantenimiento.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('DELETE /api/mantenimientos/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
