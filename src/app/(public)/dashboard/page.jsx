import Link from 'next/link'
import { all, ensureDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage () {
  await ensureDb()
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  const events = await all('SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC', [user.id])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Your Open Houses</h1>
        <Link className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition" href="/dashboard/events/new">Create Event</Link>
      </div>
      {!events.length && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-6 text-center">
          No events yet. Create your first open house.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(e => (
          <div key={e.id} className="bg-white rounded-xl shadow hover:shadow-lg transition h-full flex flex-col justify-between">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">
                <Link href={`/dashboard/events/${e.id}`}>{e.title}</Link>
              </h2>
              {e.address && <div className="text-gray-500 text-sm">{e.address}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
