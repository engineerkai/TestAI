import { NextResponse } from 'next/server'
import { get, ensureDb } from '@/lib/db'

export async function GET (_req, { params }) {
  await ensureDb()
  const event = await get('SELECT * FROM events WHERE qr_token = ?', [params.token])
  if (!event) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ id: event.id, title: event.title, address: event.address })
}
