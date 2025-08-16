import Link from 'next/link'
import { ArrowTopRightOnSquareIcon, PencilSquareIcon, QrCodeIcon, DocumentArrowDownIcon, ArrowLeftIcon, MapPinIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import { all, get } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'

export default async function EventDetail ({ params }) {
  const user = await getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  const event = await get('SELECT * FROM events WHERE id = ? AND created_by = ?', [params.id, user.id])
  if (!event) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">Not found</div>
  const rows = await all(
    `SELECT s.*, v.name, v.email, v.phone, v.preapproved, v.timeline
     FROM signins s JOIN visitors v ON s.visitor_id = v.id
     WHERE s.event_id = ?
     ORDER BY s.created_at DESC`,
    [event.id]
  )
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const signInHref = base ? `${base}/s/${event.qr_token}` : `/s/${event.qr_token}`
  const qrPngHref = base ? `${base}/api/qr/${event.qr_token}/png` : `/api/qr/${event.qr_token}/png`
  const qrPdfHref = base ? `${base}/api/qr/${event.qr_token}/pdf` : `/api/qr/${event.qr_token}/pdf`
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/dashboard"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
            {event.address && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPinIcon className="h-5 w-5" />
                <span>{event.address}</span>
              </div>
            )}
            {event.starts_at && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                <ClockIcon className="h-5 w-5" />
                <span>{new Date(event.starts_at).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a 
          className="btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
          href={signInHref} 
          target="_blank"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          Open Sign-In Page
        </a>
        <a 
          className="btn-outline shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200" 
          href={qrPngHref} 
          target="_blank"
        >
          <QrCodeIcon className="h-5 w-5" />
          Download QR PNG
        </a>
        <a 
          className="btn-outline shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200" 
          href={qrPdfHref} 
          target="_blank"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Download QR PDF
        </a>
        <Link 
          className="btn-secondary shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200" 
          href={`/dashboard/events/${event.id}/questions`}
        >
          <PencilSquareIcon className="h-5 w-5" />
          Customize Questions
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {rows.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Visitors
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <div className="h-6 w-6 text-green-600 dark:text-green-400">✓</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {rows.filter(r => r.preapproved).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pre-approved
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <div className="h-6 w-6 text-yellow-600 dark:text-yellow-400">🔥</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {rows.filter(r => r.score >= 30).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hot Leads
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <div className="h-6 w-6 text-purple-600 dark:text-purple-400">📊</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {rows.length > 0 ? Math.round(rows.reduce((acc, r) => acc + (r.score || 0), 0) / rows.length) : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Score
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="card shadow-lg">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Visitor Sign-ins
          </h2>
        </div>
        <div className="card-body p-0">
          {!rows.length ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No visitors yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Share your QR code to start collecting visitor information
              </p>
              <a 
                href={signInHref} 
                target="_blank"
                className="btn-primary inline-flex"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                Test Sign-In Page
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Phone</th>
                    <th className="table-header-cell">Pre-approved</th>
                    <th className="table-header-cell">Timeline</th>
                    <th className="table-header-cell">Score</th>
                    <th className="table-header-cell">Signed At</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {rows.map(s => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell font-medium">{s.name}</td>
                      <td className="table-cell">{s.email}</td>
                      <td className="table-cell">{s.phone}</td>
                      <td className="table-cell">
                        {s.preapproved ? (
                          <span className="badge-success">Yes</span>
                        ) : (
                          <span className="badge-info">No</span>
                        )}
                      </td>
                      <td className="table-cell">{s.timeline || '-'}</td>
                      <td className="table-cell">
                        {s.score >= 30 ? (
                          <span className="badge-error">Hot {s.score}</span>
                        ) : s.score >= 15 ? (
                          <span className="badge-warning">Warm {s.score}</span>
                        ) : (
                          <span className="badge-info">Cold {s.score}</span>
                        )}
                      </td>
                      <td className="table-cell text-sm text-gray-600 dark:text-gray-400">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
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