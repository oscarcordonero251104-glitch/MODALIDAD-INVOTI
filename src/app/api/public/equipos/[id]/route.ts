import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Lectura pública de un equipo (sin autenticación) para el flujo de escaneo de QR.
// Solo expone datos no sensibles: sin costo, proveedor, factura, notas ni responsable.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const equipo = await db.equipo.findUnique({
      where: { id },
      select: {
        id: true,
        tipo: true,
        marca: true,
        modelo: true,
        sn: true,
        codigoInterno: true,
        descripcion: true,
        estado: true,
        ubicacion: true,
        fechaAdquisicion: true,
        fechaGarantia: true,
        vidaUtil: true,
        especificaciones: true,
        foto: true,
      },
    })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ equipo })
  } catch (error) {
    console.error('GET /api/public/equipos/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
