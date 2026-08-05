import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuario, nombre } = body

    if (!usuario || !nombre) {
      return NextResponse.json(
        { error: 'Usuario y nombre son obligatorios' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { usuario: usuario.toUpperCase() },
    })

    const normalizar = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

    if (user && normalizar(user.nombre) === normalizar(nombre)) {
      await db.user.update({
        where: { id: user.id },
        data: { solicitudReset: new Date() },
      })
    }

    // Mensaje generico: no confirma ni desmiente si el usuario existe
    return NextResponse.json({
      message: 'Si los datos coinciden con un usuario registrado, tu solicitud fue enviada al administrador.',
    })
  } catch (error) {
    console.error('Solicitar reset error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
