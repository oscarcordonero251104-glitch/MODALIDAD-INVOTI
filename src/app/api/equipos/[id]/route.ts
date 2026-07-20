import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request)
    const { id } = await params
    const equipo = await db.equipo.findUnique({
      where: { id },
      include: {
        movimientos: { orderBy: { fecha: 'desc' } },
        mantenimientos: { orderBy: { fechaProgramada: 'desc' } },
      },
    })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ equipo })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('GET /api/equipos/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request)
    const { id } = await params
    const body = await request.json()
    const { tipo, marca, modelo, sn, codigoInterno, estado, ubicacion, responsable, proveedor, factura, costo, fechaAdquisicion, fechaGarantia, vidaUtil, especificaciones, notas } = body

    const existing = await db.equipo.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    const equipo = await db.equipo.update({
      where: { id },
      data: {
        tipo, marca, modelo, sn,
        codigoInterno: codigoInterno || null,
        estado: estado || 'activo',
        ubicacion: ubicacion || null,
        responsable: responsable || null,
        proveedor: proveedor || null,
        factura: factura || null,
        costo: costo || 0,
        fechaAdquisicion: fechaAdquisicion || null,
        fechaGarantia: fechaGarantia || null,
        vidaUtil: vidaUtil || 5,
        especificaciones: especificaciones ? JSON.stringify(especificaciones) : null,
        notas: notas || null,
      },
    })
    return NextResponse.json({ equipo })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('PUT /api/equipos/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request)
    const { id } = await params
    const existing = await db.equipo.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }
    await db.equipo.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('DELETE /api/equipos/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
