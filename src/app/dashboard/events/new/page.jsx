import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { ensureDb, run, get } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export default function NewEventPage () {
  const user = getUserFromRequest()
  console.log(user)
  if (!user) redirect('/dashboard/login')
  return (
    <div className="container py-4" style={{maxWidth:720}}>
      <h1 className="h4 mb-3">Create Open House</h1>
      <form action={createEvent}>
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input className="form-control" name="title" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input className="form-control" name="address" />
        </div>
        <div className="mb-3">
          <label className="form-label">Starts At</label>
          <input className="form-control" type="datetime-local" name="startsAt" />
        </div>
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  )
}

async function createEvent (formData) {
  'use server'
  const user = getUserFromRequest()
  console.log(user)
  if (!user) redirect('/dashboard/login')
  // Ensure the user referenced by the token actually exists to satisfy FK constraint
  const dbUser = await get('SELECT id FROM users WHERE id = ?', [user.id])
  if (!dbUser) redirect('/dashboard/login')
  const title = formData.get('title')
  const address = formData.get('address')
  const startsAt = formData.get('startsAt')
  await ensureDb()
  const id = uuidv4()
  const qrToken = uuidv4()
  await run(
    'INSERT INTO events (id, title, address, starts_at, qr_token, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, address || null, startsAt || null, qrToken, dbUser.id]
  )
  redirect('/dashboard')
}
