import { NextResponse } from 'next/server'
import { getTokenFromRequest, deleteSession } from '@/lib/auth'

export async function POST(request: Request) {
  const token = getTokenFromRequest(request)
  if (token) {
    await deleteSession(token)
  }
  return NextResponse.json({ success: true })
}
