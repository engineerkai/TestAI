import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { ensureDb, run, get } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NewEventPage () {
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Open House</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Set up a new event to capture visitor leads</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card shadow-xl">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Event Details</h2>
        </div>
        <div className="card-body">
          <form action={createEvent} className="space-y-6">
            <div>
              <label className="form-label">Event Title *</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  className="form-input pl-10" 
                  name="title" 
                  placeholder="e.g., Downtown Condo Open House"
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Property Address</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  className="form-input pl-10" 
                  name="address" 
                  placeholder="e.g., 123 Main St, Downtown"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Event Date & Time</label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  className="form-input pl-10" 
                  type="datetime-local" 
                  name="startsAt" 
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leave empty if you want to set the time later
              </p>
            </div>

            <div className="pt-4">
              <button className="btn-primary w-full h-12 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" type="submit">
                <PlusIcon className="h-5 w-5" />
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          After creating your event, you'll get a QR code that visitors can scan to sign in.
        </p>
      </div>
    </div>
  )
}

async function createEvent (formData) {
  'use server'
  const user = getUserFromRequest()
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
