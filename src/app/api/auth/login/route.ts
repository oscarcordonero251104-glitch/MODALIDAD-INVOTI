import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuario, password, rol } = body

    if (!usuario || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son obligatorios' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { usuario: usuario.toUpperCase() },
    })

    if (!user || !await verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    if (user.estado === 'pendiente') {
      return NextResponse.json(
        { error: 'Tu solicitud de acceso está pendiente de aprobación. Esperá a que un administrador la autorice.' },
        { status: 403 }
      )
    }

    if (user.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Usuario inactivo — contactá al administrador' },
        { status: 403 }
      )
    }

    const token = generateToken({
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol,
      estado: user.estado,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        rol: user.rol,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
