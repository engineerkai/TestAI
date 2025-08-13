import nodemailer from 'nodemailer'
import twilio from 'twilio'
import { run } from './db.js'

function getMailer () {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })
}

function getTwilio () {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

export async function sendEmail ({ to, subject, text, html, meta = {} }) {
  const transporter = getMailer()
  const id = cryptoRandomId()
  await run('INSERT INTO messages (id, channel, template, status, meta) VALUES (?, ?, ?, ?, ?)', [id, 'email', subject || '', 'queued', JSON.stringify(meta)])
  if (!transporter) {
    await run('UPDATE messages SET status = ? WHERE id = ?', ['skipped:no_smtp', id])
    return { id, status: 'skipped' }
  }
  try {
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text, html })
    await run('UPDATE messages SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?', ['sent', id])
    return { id, status: 'sent' }
  } catch (e) {
    await run('UPDATE messages SET status = ? WHERE id = ?', [`error:${e.message}`, id])
    return { id, status: 'error', error: e.message }
  }
}

export async function sendSms ({ to, body, meta = {} }) {
  const client = getTwilio()
  const id = cryptoRandomId()
  await run('INSERT INTO messages (id, channel, template, status, meta) VALUES (?, ?, ?, ?, ?)', [id, 'sms', body?.slice(0, 120) || '', 'queued', JSON.stringify(meta)])
  if (!client || !process.env.TWILIO_FROM_NUMBER) {
    await run('UPDATE messages SET status = ? WHERE id = ?', ['skipped:no_twilio', id])
    return { id, status: 'skipped' }
  }
  try {
    await client.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to, body })
    await run('UPDATE messages SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?', ['sent', id])
    return { id, status: 'sent' }
  } catch (e) {
    await run('UPDATE messages SET status = ? WHERE id = ?', [`error:${e.message}`, id])
    return { id, status: 'error', error: e.message }
  }
}

function cryptoRandomId () {
  return 'm_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}
