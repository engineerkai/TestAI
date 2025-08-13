import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ensureDb, get, run } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import Builder from './Builder'

export const dynamic = 'force-dynamic'

export default async function EventQuestionsPage ({ params }) {
  await ensureDb()
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  // Ensure the event belongs to this user
  const event = await get('SELECT * FROM events WHERE id = ? AND created_by = ?', [params.id, user.id])
  if (!event) return <div className="container py-4">Not found</div>
  const schema = event.form_schema ? JSON.parse(event.form_schema) : []

  return (
    <div className="container py-4" style={{maxWidth: 960}}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Customize Sign-In Questions</h1>
        <Link className="btn btn-outline-secondary" href={`/dashboard/events/${event.id}`}>Back to Event</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <form action={saveSchema.bind(null, event.id)}>
            <Builder initialSchema={schema} />
            <input type="hidden" name="schema" id="schema_json" />
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn btn-outline-secondary" formAction={loadStarter.bind(null, event.id)} type="submit">Load Starter Template</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

async function saveSchema (eventId, formData) {
  'use server'
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  await ensureDb()
  const schemaText = formData.get('schema') || '[]'
  let parsed
  try {
    parsed = JSON.parse(schemaText)
    if (!Array.isArray(parsed)) throw new Error('Schema must be an array')
  } catch (e) {
    // On parse error, keep user on page by redirecting back. In a full app we would flash an error.
    return
  }
  await run('UPDATE events SET form_schema = ? WHERE id = ? AND created_by = ?', [JSON.stringify(parsed), eventId, user.id])
  redirect(`/dashboard/events/${eventId}`)
}

async function loadStarter (eventId, _formData) {
  'use server'
  const user = getUserFromRequest()
  if (!user) redirect('/dashboard/login')
  await ensureDb()
  const starter = [
    { name: 'how_hear', label: 'How did you hear about this open house?', type: 'select', required: true, options: ['Zillow','Redfin','Friend','Drive-by','Other'] },
    { name: 'beds_needed', label: 'How many bedrooms are you looking for?', type: 'select', options: ['1','2','3','4+'] },
    { name: 'moving_timeframe', label: 'Desired move-in timeframe', type: 'select', options: ['0-1 months','1-3 months','3-6 months','6+ months'] },
    { name: 'agent_representation', label: 'Are you currently working with an agent?', type: 'checkbox' },
    { name: 'notes', label: 'Notes (anything else?)', type: 'text', placeholder: 'Optional notes' }
  ]
  await run('UPDATE events SET form_schema = ? WHERE id = ? AND created_by = ?', [JSON.stringify(starter), eventId, user.id])
  redirect(`/dashboard/events/${eventId}/questions`)
}
