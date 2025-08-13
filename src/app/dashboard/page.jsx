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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Your Open Houses</h1>
        <Link className="btn btn-primary" href="/dashboard/events/new">Create Event</Link>
      </div>
      {!events.length && <div className="alert alert-info">No events yet. Create your first open house.</div>}
      <div className="row g-3">
        {events.map(e => (
          <div className="col-md-6" key={e.id}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h5"><Link href={`/dashboard/events/${e.id}`}>{e.title}</Link></h2>
                {e.address && <div className="text-muted">{e.address}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
