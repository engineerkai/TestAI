import Link from 'next/link'
import { all, ensureDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CalendarIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage () {
  await ensureDb()
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  
  const events = await all('SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC', [user.id])
  const allSignins = await all(`
    SELECT s.*, v.name, v.email, v.phone, v.preapproved, v.timeline, e.title as event_title
    FROM signins s 
    JOIN visitors v ON s.visitor_id = v.id
    JOIN events e ON s.event_id = e.id
    WHERE e.created_by = ?
    ORDER BY s.created_at DESC
  `, [user.id])

  // Calculate metrics
  const totalEvents = events.length
  const totalVisitors = allSignins.length
  const preapprovedVisitors = allSignins.filter(s => s.preapproved).length
  const hotLeads = allSignins.filter(s => s.score >= 30).length
  const warmLeads = allSignins.filter(s => s.score >= 15 && s.score < 30).length
  const coldLeads = allSignins.filter(s => s.score < 15).length
  const avgScore = totalVisitors > 0 ? Math.round(allSignins.reduce((acc, s) => acc + (s.score || 0), 0) / totalVisitors) : 0

  // Recent activity
  const recentSignins = allSignins.slice(0, 5)
  const upcomingEvents = events.filter(e => e.starts_at && new Date(e.starts_at) > new Date()).slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/dashboard"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your open house performance and visitor insights</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {totalEvents}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Events
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {totalVisitors}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Visitors
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {avgScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Lead Score
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <div className="h-6 w-6 text-yellow-600 dark:text-yellow-400">✓</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {preapprovedVisitors}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pre-approved
            </div>
          </div>
        </div>
      </div>

      {/* Lead Quality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Lead Quality Distribution
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hot Leads</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{hotLeads}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {totalVisitors > 0 ? Math.round((hotLeads / totalVisitors) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Warm Leads</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{warmLeads}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {totalVisitors > 0 ? Math.round((warmLeads / totalVisitors) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cold Leads</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{coldLeads}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {totalVisitors > 0 ? Math.round((coldLeads / totalVisitors) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Upcoming Events
            </h2>
          </div>
          <div className="card-body">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                      {event.address && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {event.address}
                        </div>
                      )}
                    </div>
                    <Link 
                      href={`/dashboard/events/${event.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <EyeIcon className="h-5 w-5" />
            Recent Sign-ins
          </h2>
        </div>
        <div className="card-body p-0">
          {recentSignins.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No sign-ins yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start creating events to see visitor activity here
              </p>
              <Link 
                href="/dashboard/events/new"
                className="btn-primary inline-flex"
              >
                Create Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Visitor</th>
                    <th className="table-header-cell">Event</th>
                    <th className="table-header-cell">Score</th>
                    <th className="table-header-cell">Pre-approved</th>
                    <th className="table-header-cell">Signed At</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {recentSignins.map(s => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{s.email}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900 dark:text-white">{s.event_title}</div>
                      </td>
                      <td className="table-cell">
                        {s.score >= 30 ? (
                          <span className="badge-error">Hot {s.score}</span>
                        ) : s.score >= 15 ? (
                          <span className="badge-warning">Warm {s.score}</span>
                        ) : (
                          <span className="badge-info">Cold {s.score}</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {s.preapproved ? (
                          <span className="badge-success">Yes</span>
                        ) : (
                          <span className="badge-info">No</span>
                        )}
                      </td>
                      <td className="table-cell text-sm text-gray-600 dark:text-gray-400">
                        {new Date(s.created_at).toLocaleDateString()}
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
