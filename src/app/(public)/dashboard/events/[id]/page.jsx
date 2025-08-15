import Link from 'next/link'
import { ArrowTopRightOnSquareIcon, PencilSquareIcon, QrCodeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          {event.address && <div className="text-gray-500">{event.address}</div>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow transition-transform duration-200 hover:scale-105" href={qrPngHref} target="_blank">
            <QrCodeIcon className="h-5 w-5" /> QR PNG
          </a>
          <a className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow transition-transform duration-200 hover:scale-105" href={qrPdfHref} target="_blank">
            <DocumentArrowDownIcon className="h-5 w-5" /> QR PDF
          </a>
          <a className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform duration-200 hover:scale-105" href={signInHref} target="_blank">
            <ArrowTopRightOnSquareIcon className="h-5 w-5" /> Open Sign-In
          </a>
          <a className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg shadow transition-transform duration-200 hover:scale-105" href={`/dashboard/events/${event.id}/questions`}>
            <PencilSquareIcon className="h-5 w-5" /> Customize Questions
          </a>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Visitors</h2>
        {!rows.length ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-0 text-center">No visitors yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pre-approved</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Signed At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{s.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{s.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{s.phone}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{s.preapproved ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{s.timeline || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {s.score >= 30 ? (
                        <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">Hot {s.score}</span>
                      ) : s.score >= 15 ? (
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">Warm {s.score}</span>
                      ) : (
                        <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">Cold {s.score}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
  )
}