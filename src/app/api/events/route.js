import { NextResponse } from 'next/server'
import { all, run, ensureDb, get } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET () {
  await ensureDb()
  const user = getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await all('SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC', [user.id])
  return NextResponse.json(rows)
}

export async function POST (req) {
  await ensureDb()
  const user = getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // Ensure the user referenced by the token actually exists to satisfy FK constraint
  const dbUser = await get('SELECT id FROM users WHERE id = ?', [user.id])
  if (!dbUser) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { title, address, propertyDetails, startsAt } = await req.json()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
  const id = uuidv4()
  const qrToken = uuidv4()
  await run(
    'INSERT INTO events (id, title, address, property_details, starts_at, qr_token, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, address || null, propertyDetails ? JSON.stringify(propertyDetails) : null, startsAt || null, qrToken, dbUser.id]
  )
  const base = process.env.NEXT_PUBLIC_BASE_URL
  return NextResponse.json({
    id,
    qrToken,
    signInUrl: `${base}/s/${qrToken}`,
    qrPng: `${base}/api/qr/${qrToken}/png`,
    qrPdf: `${base}/api/qr/${qrToken}/pdf`
  }, { status: 201 })
}
