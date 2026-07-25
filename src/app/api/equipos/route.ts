import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const equipos = await db.equipo.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        movimientos: { orderBy: { fecha: 'desc' }, take: 5 },
        mantenimientos: { orderBy: { fechaProgramada: 'desc' }, take: 5 },
      },
    })
    return NextResponse.json({ equipos })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('GET /api/equipos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request)
    const body = await request.json()
    const { tipo, marca, modelo, sn, codigoInterno, estado, ubicacion, responsable, proveedor, factura, costo, fechaAdquisicion, fechaGarantia, vidaUtil, especificaciones, notas, foto } = body

    if (!tipo || !marca || !modelo || !sn) {
      return NextResponse.json({ error: 'Tipo, marca, modelo y número de serie son obligatorios' }, { status: 400 })
    }

    const existing = await db.equipo.findUnique({ where: { sn } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un equipo con ese número de serie' }, { status: 409 })
    }

    if (codigoInterno) {
      const existingCodigo = await db.equipo.findUnique({ where: { codigoInterno } })
      if (existingCodigo) {
        return NextResponse.json({ error: 'Ya existe un equipo con ese código interno' }, { status: 409 })
      }
    }

    const equipo = await db.equipo.create({
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
        foto: foto || null,
      },
    })
    return NextResponse.json({ equipo })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('POST /api/equipos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
