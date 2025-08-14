import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { ensureDb, run, get } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export default function NewEventPage () {
  const user = getUserFromRequest()
  console.log(user)
  if (!user) redirect('/dashboard/login')
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Open House</h1>
      <form action={createEvent} className="bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" name="title" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" name="address" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Starts At</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="datetime-local" name="startsAt" />
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition">Create</button>
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
