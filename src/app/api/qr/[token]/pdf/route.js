import { NextResponse } from 'next/server'
import { get, ensureDb } from '@/lib/db'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

export async function GET (_req, { params }) {
  await ensureDb()
  const event = await get('SELECT * FROM events WHERE qr_token = ?', [params.token])
  if (!event) return new NextResponse('Not found', { status: 404 })
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const url = `${base}/s/${event.qr_token}`

  const stream = new ReadableStream({
    async start (controller) {
      const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
      const chunks = []
      doc.on('data', (c) => chunks.push(c))
      doc.on('end', () => {
        const buf = Buffer.concat(chunks)
        controller.enqueue(buf)
        controller.close()
      })

      doc.fontSize(24).text(event.title, { align: 'center' })
      if (event.address) doc.moveDown().fontSize(14).text(event.address, { align: 'center' })
      doc.moveDown(2)
      const png = await QRCode.toBuffer(url, { width: 512, margin: 1 })
      const x = (doc.page.width - 300) / 2
      doc.image(png, x, doc.y, { width: 300 })
      doc.moveDown(1)
      doc.fontSize(12).text('Scan to sign in', { align: 'center' })
      doc.end()
    }
  })

  return new NextResponse(stream, { headers: { 'Content-Type': 'application/pdf' } })
}
