import { NextResponse } from 'next/server'
import { get, ensureDb } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET (_req, { params }) {
  await ensureDb()
  const event = await get('SELECT * FROM events WHERE qr_token = ?', [params.token])
  if (!event) return new NextResponse('Not found', { status: 404 })
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const url = `${base}/s/${event.qr_token}`
  const png = await QRCode.toBuffer(url, { width: 512, margin: 2 })
  return new NextResponse(png, { headers: { 'Content-Type': 'image/png' } })
}
