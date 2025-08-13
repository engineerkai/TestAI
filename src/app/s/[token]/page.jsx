"use client"
import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function SignInPage ({ params }) {
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

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

  if (done) return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm"><div className="card-body text-center">
            <h1 className="h4 mb-3">Thank you for signing in!</h1>
            {event && <p>We appreciate your visit to <strong>{event.title}</strong>{event.address && <> at {event.address}</>}.</p>}
            <p>You can close this page.</p>
          </div></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm"><div className="card-body">
            {event && <>
              <h1 className="h4 mb-1">{event.title}</h1>
              {event.address && <p className="text-muted mb-3">{event.address}</p>}
            </>}
            <h2 className="h5 mb-3">Sign In</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input name="name" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone *</label>
                <input name="phone" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Budget (optional)</label>
                <input name="budget" className="form-control" placeholder="$600,000" />
              </div>
              <div className="mb-3">
                <label className="form-label">Buying timeline (optional)</label>
                <select name="timeline" className="form-select">
                  <option value="">Select...</option>
                  <option>0-1 months</option>
                  <option>1-3 months</option>
                  <option>3-6 months</option>
                  <option>6+ months</option>
                </select>
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="pre" name="preapproved" value="1" />
                <label className="form-check-label" htmlFor="pre">I am pre-approved</label>
              </div>
              <div className="mb-3">
                <label className="form-label">Preferred neighborhoods (optional)</label>
                <input name="neighborhoods" className="form-control" placeholder="e.g., Downtown, Lakeview" />
              </div>
              {event?.formSchema?.length ? (
                <>
                  <h3 className="h6 text-uppercase text-muted mt-4">Additional Questions</h3>
                  {event.formSchema.map((f, i) => (
                    <div className="mb-3" key={i}>
                      {f.type !== 'checkbox' && (
                        <label className="form-label">{f.label || f.name}{f.required ? ' *' : ''}</label>
                      )}
                      {f.type === 'select' ? (
                        <select name={f.name} className="form-select" required={!!f.required}>
                          <option value="">Select...</option>
                          {(f.options || []).map((opt, idx) => (
                            <option key={idx} value={opt.value ?? opt}>{opt.label ?? opt}</option>
                          ))}
                        </select>
                      ) : f.type === 'checkbox' ? (
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id={`q_${i}`} name={f.name} value="1" />
                          <label className="form-check-label" htmlFor={`q_${i}`}>{f.label || f.name}</label>
                        </div>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          name={f.name}
                          className="form-control"
                          required={!!f.required}
                          placeholder={f.placeholder || ''}
                        />
                      )}
                    </div>
                  ))}
                </>
              ) : null}
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="consent" name="consent" value="1" required />
                <label className="form-check-label" htmlFor="consent">I consent to be contacted about this property and related listings.</label>
              </div>
              <button className="btn btn-primary w-100" type="submit">Submit</button>
            </form>
            <p className="text-muted small mt-3">Your information is stored securely and will not be shared without your consent.</p>
          </div></div>
        </div>
      </div>
    </div>
  )
}
