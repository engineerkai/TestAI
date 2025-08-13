import Link from 'next/link'
import { all, get } from '@/src/lib/db'
import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/src/lib/auth'

export default async function EventDetail ({ params }) {
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  const event = await get('SELECT * FROM events WHERE id = ? AND created_by = ?', [params.id, user.id])
  if (!event) return <div className="container py-4">Not found</div>
  const rows = await all(
    `SELECT s.*, v.name, v.email, v.phone, v.preapproved, v.timeline
     FROM signins s JOIN visitors v ON s.visitor_id = v.id
     WHERE s.event_id = ?
     ORDER BY s.created_at DESC`,
    [event.id]
  )
  const base = process.env.NEXT_PUBLIC_BASE_URL
  return (
    <div className="container py-4" style={{maxWidth:960}}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 m-0">{event.title}</h1>
          {event.address && <div className="text-muted">{event.address}</div>}
        </div>
        <div className="d-flex gap-2">
          <a className="btn btn-outline-secondary" href={`${base}/api/qr/${event.qr_token}/png`} target="_blank">QR PNG</a>
          <a className="btn btn-outline-secondary" href={`${base}/api/qr/${event.qr_token}/pdf`} target="_blank">QR PDF</a>
          <a className="btn btn-primary" href={`${base}/s/${event.qr_token}`} target="_blank">Open Sign-In</a>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h2 className="h6 text-uppercase text-muted">Visitors</h2>
          {!rows.length ? (
            <div className="alert alert-info mb-0">No visitors yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Pre-approved</th>
                    <th>Timeline</th>
                    <th>Score</th>
                    <th>Signed At</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.phone}</td>
                      <td>{s.preapproved ? 'Yes' : 'No'}</td>
                      <td>{s.timeline || '-'}</td>
                      <td>
                        {s.score >= 30 ? (
                          <span className="badge bg-danger">Hot {s.score}</span>
                        ) : s.score >= 15 ? (
                          <span className="badge bg-warning text-dark">Warm {s.score}</span>
                        ) : (
                          <span className="badge bg-secondary">Cold {s.score}</span>
                        )}
                      </td>
                      <td>{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
