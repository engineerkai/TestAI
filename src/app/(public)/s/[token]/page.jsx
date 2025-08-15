"use client"
import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function SignInPage ({ params }) {
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Fetch minimal event info
    fetch(`/api/events-info/${params.token}`).then(async r => {
      if (r.ok) setEvent(await r.json())
    })
  }, [params.token])

  const submit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    payload.preapproved = !!payload.preapproved
    payload.consent = !!payload.consent
    const r = await fetch(`/api/signin/${params.token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (r.ok) setDone(true)
    else setError('Please fill required fields')
  }

  useEffect(() => {
    if (!done) return;
    if (countdown === 0) {
      window.location.href = `/s/${params.token}`;
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [done, countdown, params.token]);

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank you for signing in!</h1>
          {event && <p className="mb-2">We appreciate your visit to <strong>{event.title}</strong>{event.address && <> at {event.address}</>}.</p>}
          <p className="text-gray-500 mb-2">Redirecting to event page in <span className="font-semibold">{countdown}</span> seconds...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {event && <>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{event.title}</h1>
            {event.address && <p className="text-gray-500 mb-3">{event.address}</p>}
          </>}
          {error && <div className="bg-red-100 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-center">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input name="name" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" name="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input name="phone" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (optional)</label>
              <input name="budget" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="$600,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buying timeline (optional)</label>
              <select name="timeline" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option>0-1 months</option>
                <option>1-3 months</option>
                <option>3-6 months</option>
                <option>6+ months</option>
              </select>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="rounded mr-2" id="pre" name="preapproved" value="1" />
              <label className="text-sm text-gray-700" htmlFor="pre">I am pre-approved</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred neighborhoods (optional)</label>
              <input name="neighborhoods" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Downtown, Lakeview" />
            </div>
            {event?.formSchema?.length ? (
              <>
                <h3 className="text-sm font-semibold text-gray-500 mt-4 mb-2">Additional Questions</h3>
                {event.formSchema.map((f, i) => (
                  <div className="mb-3" key={i}>
                    {f.type !== 'checkbox' && (
                      <label className="block text-sm font-medium text-gray-700 mb-2">{f.label || f.name}{f.required ? ' *' : ''}</label>
                    )}
                    {f.type === 'select' ? (
                      <select name={f.name} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required={!!f.required}>
                        <option value="">Select...</option>
                        {(f.options || []).map((opt, idx) => (
                          <option key={idx} value={opt.value ?? opt}>{opt.label ?? opt}</option>
                        ))}
                      </select>
                    ) : f.type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input type="checkbox" className="rounded mr-2" id={`q_${i}`} name={f.name} value="1" />
                        <label className="text-sm text-gray-700" htmlFor={`q_${i}`}>{f.label || f.name}</label>
                      </div>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        name={f.name}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!!f.required}
                        placeholder={f.placeholder || ''}
                      />
                    )}
                  </div>
                ))}
              </>
            ) : null}
            <div className="flex items-center">
              <input type="checkbox" className="rounded mr-2" id="consent" name="consent" value="1" required />
              <label className="text-sm text-gray-700" htmlFor="consent">I consent to be contacted about this property and related listings.</label>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition" type="submit">Submit</button>
          </form>
          <p className="text-gray-500 text-xs mt-4">Your information is stored securely and will not be shared without your consent.</p>
        </div>
      </div>
    </div>
  )
}
