"use client"
import { useEffect, useState } from 'react'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

export default function SignInPage ({ params }) {
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Fetch minimal event info
    fetch(`/api/events-info/${params.token}`).then(async r => {
      if (r.ok) setEvent(await r.json())
    })
  }, [params.token])

  const submit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const form = new FormData(e.currentTarget)
      const payload = Object.fromEntries(form.entries())
      payload.preapproved = !!payload.preapproved
      payload.consent = !!payload.consent
      
      const r = await fetch(`/api/signin/${params.token}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      
      if (r.ok) {
        setDone(true)
      } else {
        setError('Please fill in all required fields correctly.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-lg">
        <div className="card shadow-xl text-center fade-in">
          <div className="card-body">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Thank you for signing in!</h1>
            {event && (
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We appreciate your visit to <strong className="text-gray-900 dark:text-white">{event.title}</strong>
                {event.address && (
                  <span className="block mt-1">at {event.address}</span>
                )}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Redirecting to event page in <span className="font-semibold text-blue-600 dark:text-blue-400">{countdown}</span> seconds...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-lg">
        {/* Header */}
        {event && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <BuildingOfficeIcon className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
            {event.address && (
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4" />
                <span>{event.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Sign-in Form */}
        <div className="card shadow-xl fade-in">
          <div className="card-body">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Required Information
                </h3>
                
                <div>
                  <label className="form-label">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      name="name" 
                      className="form-input pl-10" 
                      placeholder="Enter your full name"
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Email Address *</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="email" 
                      name="email" 
                      className="form-input pl-10" 
                      placeholder="Enter your email address"
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Phone Number *</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      name="phone" 
                      className="form-input pl-10" 
                      placeholder="Enter your phone number"
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Additional Information
                </h3>
                
                <div>
                  <label className="form-label">Budget Range</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      name="budget" 
                      className="form-input pl-10" 
                      placeholder="e.g., $600,000 - $800,000" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Buying Timeline</label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select name="timeline" className="form-select pl-10">
                      <option value="">Select your timeline...</option>
                      <option value="0-1 months">0-1 months</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Preferred Neighborhoods</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      name="neighborhoods" 
                      className="form-input pl-10" 
                      placeholder="e.g., Downtown, Lakeview, Westside" 
                    />
                  </div>
                </div>
              </div>

              {/* Custom Questions */}
              {event?.formSchema?.length ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Additional Questions
                  </h3>
                  {event.formSchema.map((f, i) => (
                    <div className="mb-3" key={i}>
                      {f.type !== 'checkbox' && (
                        <label className="form-label">
                          {f.label || f.name}{f.required ? ' *' : ''}
                        </label>
                      )}
                      {f.type === 'select' ? (
                        <select name={f.name} className="form-select" required={!!f.required}>
                          <option value="">Select...</option>
                          {(f.options || []).map((opt, idx) => (
                            <option key={idx} value={opt.value ?? opt}>{opt.label ?? opt}</option>
                          ))}
                        </select>
                      ) : f.type === 'checkbox' ? (
                        <div className="flex items-center">
                          <input type="checkbox" className="form-checkbox mr-3" id={`q_${i}`} name={f.name} value="1" />
                          <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor={`q_${i}`}>
                            {f.label || f.name}
                          </label>
                        </div>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          name={f.name}
                          className="form-input"
                          required={!!f.required}
                          placeholder={f.placeholder || ''}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Checkboxes */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start">
                  <input type="checkbox" className="form-checkbox mr-3 mt-1" id="pre" name="preapproved" value="1" />
                  <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="pre">
                    I am pre-approved for financing
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" className="form-checkbox mr-3 mt-1" id="consent" name="consent" value="1" required />
                  <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="consent">
                    I consent to be contacted about this property and related listings
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className="btn-primary w-full h-12 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="loading-button"></div>
                ) : (
                  'Complete Sign-in'
                )}
              </button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Your information is stored securely and will not be shared without your consent. 
                This helps us provide you with the best possible service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
