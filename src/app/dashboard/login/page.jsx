"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const submit = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (r.ok) router.push('/dashboard')
    else setError('Invalid credentials')
  }

  const register = async () => {
    const pwd = Math.random().toString(36).slice(2, 10) + '!A1'
    const r = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pwd }) })
    if (r.ok) alert('Registered. Use your password: ' + pwd)
    else alert('Registration failed')
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-3">Agent Login</h1>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary w-100">Login</button>
              </form>
              <hr />
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Email to register" value={email} onChange={e=>setEmail(e.target.value)} />
                <button className="btn btn-outline-secondary" onClick={register}>Register</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
