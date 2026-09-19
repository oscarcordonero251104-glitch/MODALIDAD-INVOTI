import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAuth(request)
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
    const user = await requireAuth(request)
    const body = await request.json()
    const { equipoId, tipo, diagnostico, tecnicoDiagnostico, descripcion, fechaProgramada, fechaEjecucion, tecnico, estado, costo } = body

    const equipo = equipoId ? await db.equipo.findUnique({ where: { id: equipoId } }) : null
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    if (user.rol !== 'admin') {
      // Un tecnico solo puede crear una SOLICITUD de mantenimiento: equipo + diagnostico.
      // El resto (tipo, detalle, fecha, tecnico asignado) lo completa el administrador.
      if (!diagnostico) {
        return NextResponse.json({ error: 'El diagnóstico es obligatorio' }, { status: 400 })
      }
      const mantenimiento = await db.mantenimiento.create({
        data: {
          equipoId,
          diagnostico,
          tecnicoDiagnostico: user.nombre,
          ubicacion: equipo.ubicacion || null,
          estado: 'Solicitado',
        },
        include: { equipo: true },
      })
      return NextResponse.json({ mantenimiento })
    }

    if (!tipo || !diagnostico || !tecnicoDiagnostico || !descripcion || !fechaProgramada || !tecnico) {
      return NextResponse.json({ error: 'Equipo, tipo, diagnóstico, técnico que diagnosticó, descripción, fecha programada y técnico son obligatorios' }, { status: 400 })
    }

    const mantenimiento = await db.mantenimiento.create({
      data: {
        equipoId, tipo, descripcion, fechaProgramada,
        diagnostico, tecnicoDiagnostico,
        ubicacion: equipo.ubicacion || null,
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
