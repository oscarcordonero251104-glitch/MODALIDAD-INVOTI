import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuario, password, nombre, rol } = body

    if (!usuario || !password || !nombre) {
      return NextResponse.json(
        { error: 'Usuario, contraseña y nombre son obligatorios' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({
      where: { usuario: usuario.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: {
        usuario: usuario.toUpperCase(),
        password: hashedPassword,
        nombre,
        rol: rol || 'tecnico',
        estado: 'pendiente', // Pendiente de aprobación del administrador
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud de acceso enviada. Un administrador revisará tu solicitud.',
      usuario: user.usuario,
      nombre: user.nombre,
      estado: user.estado,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
