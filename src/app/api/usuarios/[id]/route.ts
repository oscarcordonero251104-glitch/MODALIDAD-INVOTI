import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// Listar TODOS los usuarios (incluye pendientes) — solo admin
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

// Aprobar o rechazar una solicitud de acceso — solo admin
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { accion } = body // "aprobar" | "rechazar"

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (accion === 'aprobar') {
      const updated = await db.user.update({
        where: { id },
        data: { estado: 'activo' },
        select: { id: true, usuario: true, nombre: true, rol: true, estado: true },
      })
      return NextResponse.json({ user: updated, message: 'Solicitud aprobada' })
    } else if (accion === 'rechazar') {
      await db.user.delete({ where: { id } })
      return NextResponse.json({ message: 'Solicitud rechazada y eliminada' })
    } else if (accion === 'desactivar') {
      const updated = await db.user.update({
        where: { id },
        data: { estado: 'inactivo' },
        select: { id: true, usuario: true, nombre: true, rol: true, estado: true },
      })
      return NextResponse.json({ user: updated, message: 'Usuario desactivado' })
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof Response) return error
    console.error('PATCH /api/usuarios/[id] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
