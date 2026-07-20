import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return NextResponse.json({ user })
}
