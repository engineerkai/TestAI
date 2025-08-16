"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserPlusIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function LoginPage () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const submit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const r = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password }) 
      })
      
      if (r.ok) {
        router.push('/dashboard')
      } else {
        setError('Invalid credentials. Please check your email and password.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async () => {
    if (!email) {
      setError('Please enter an email address to register.')
      return
    }
    
    setIsRegistering(true)
    setError('')
    
    try {
      const pwd = Math.random().toString(36).slice(2, 10) + '!A1'
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
      })
      
      if (r.ok) {
        setSuccessMessage(`Account created successfully! Your password is: ${pwd}`)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 10000)
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred during registration.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white text-4xl font-bold shadow-xl flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your TestAI account</p>
        </div>

        {/* Main Form Card */}
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

            {showSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  {successMessage}
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    className="form-input pl-10" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Enter your email"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    className="form-input pl-10" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Enter your password"
                    required 
                  />
                </div>
              </div>
              
              <button 
                className="btn-primary w-full h-12 text-base" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-button"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Quick Registration</span>
              </div>
            </div>

            {/* Registration Section */}
            <div className="space-y-4">
              <div>
                <label className="form-label">Email for Registration</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    className="form-input pl-10" 
                    placeholder="Enter email to register" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <button 
                className="btn-outline w-full h-12 text-base" 
                onClick={register}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <div className="loading-button"></div>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              Your account information is secure and encrypted. 
              <br />
              Need help? Contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
