import Link from 'next/link'
import { all, ensureDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { 
  PlusIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

export default async function DashboardPage () {
  await ensureDb()
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  const events = await all('SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC', [user.id])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, Agent!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your open houses and track visitor leads
            </p>
          </div>
          <Link 
            className="btn-primary text-base px-6 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
            href="/dashboard/events/new"
          >
            <PlusIcon className="h-5 w-5" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {events.length}
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
              {events.reduce((acc, event) => acc + (event.visitor_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Visitors
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {events.filter(e => e.starts_at && new Date(e.starts_at) > new Date()).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Upcoming Events
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Open Houses
          </h2>
          {events.length > 0 && (
            <Link 
              href="/dashboard/all-signins" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View All Sign-ins
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>

        {!events.length ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Create your first open house to start capturing visitor leads and growing your business.
            </p>
            <Link 
              href="/dashboard/events/new" 
              className="btn-primary inline-flex"
            >
              <PlusIcon className="h-5 w-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Link href={`/dashboard/events/${event.id}`}>
                        {event.title}
                      </Link>
                    </h3>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  {event.address && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{event.address}</span>
                    </div>
                  )}
                  
                  {event.starts_at && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                      <ClockIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {new Date(event.starts_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(event.created_at).toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/dashboard/events/${event.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      View Details
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/events/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <PlusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">New Event</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Create open house</div>
              </div>
            </Link>

            <Link 
              href="/dashboard/all-signins"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">View Leads</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">All sign-ins</div>
              </div>
            </Link>

            <Link 
              href="/dashboard/analytics"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Analytics</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Performance data</div>
              </div>
            </Link>

            <Link 
              href="/dashboard/settings"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <CogIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Settings</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Preferences</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
