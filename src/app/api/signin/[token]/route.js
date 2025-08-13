import { NextResponse } from 'next/server'
import { get, run, ensureDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { scoreLead } from '@/lib/scoring'
import { sendEmail, sendSms } from '@/lib/messenger'

export async function POST (req, { params }) {
  await ensureDb()
  const event = await get('SELECT * FROM events WHERE qr_token = ?', [params.token])
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  const { name, email, phone, budget, timeline, preapproved, neighborhoods, consent } = await req.json()
  if (!name || !email || !phone) return NextResponse.json({ error: 'required fields missing' }, { status: 400 })

  let visitor = await get('SELECT * FROM visitors WHERE email = ? AND phone = ?', [email, phone])
  if (!visitor) {
    const vid = uuidv4()
    await run(
      'INSERT INTO visitors (id, name, email, phone, budget, timeline, preapproved, neighborhoods, consent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [vid, name, email, phone, budget || null, timeline || null, preapproved ? 1 : 0, neighborhoods || null, consent ? 1 : 0]
    )
    visitor = await get('SELECT * FROM visitors WHERE id = ?', [vid])
  }

  const score = scoreLead({ budget, timeline, preapproved: !!preapproved, consent: !!consent })
  const sid = uuidv4()
  await run('INSERT INTO signins (id, event_id, visitor_id, score) VALUES (?, ?, ?, ?)', [sid, event.id, visitor.id, score])

  const title = 'Thanks for visiting!'
  const address = event.address || ''
  const subject = `Thanks for visiting ${address || event.title}`
  const message = `Hi ${name},\n\nThanks for visiting ${event.title}${address ? ' at ' + address : ''}. We appreciate your time. Reply to this email with any questions, or let me know if you'd like similar listings.\n\n— Your Agent`
  sendEmail({ to: email, subject, text: message, meta: { eventId: event.id, visitorId: visitor.id } }).catch(() => {})
  if (phone) {
    const smsText = `Thanks for visiting ${event.title}. Reply if you want similar homes!`
    sendSms({ to: phone, body: smsText, meta: { eventId: event.id, visitorId: visitor.id } }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
