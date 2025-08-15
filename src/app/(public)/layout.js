"use client"
import '../globals.css'

// export const metadata = {
//   title: 'Visitor Register',
//   description: 'Open house QR sign-in and lead capture'
// }

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark') {
        document.documentElement.classList.add('dark')
        setDark(true)
      } else {
        document.documentElement.classList.remove('dark')
        setDark(false)
      }
    }
  }, [])
  const toggle = () => {
    if (typeof window !== 'undefined') {
      if (dark) {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
        setDark(false)
      } else {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
        setDark(true)
      }
    }
  }
  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-2 shadow-lg transition-colors duration-300"
      aria-label="Toggle dark mode"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}

export default function RootLayout ({ children }) {
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/events/new', label: 'New Event' },
    { href: '/dashboard/all-signins', label: 'All Sign-Ins' }
  ];
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  let currentPath = pathname;
  try {
    currentPath = usePathname ? usePathname() : pathname;
  } catch {}

  // Simple client-side auth check (cookie or localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Example: check for token in cookies or localStorage
      const token = document.cookie.match(/(^|;)\s*token=([^;]*)/)?.[2] || localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);
  // Only allow unauthenticated access to /s/[token]/page
  const isSTokenPage = currentPath.startsWith('/s/') && /\/s\/[^/]+$/.test(currentPath);

  if (!isLoggedIn && !isSTokenPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex items-center justify-center min-h-screen">
          <DarkModeToggle />
          <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-950 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="mb-6">You must be logged in to view this page.</p>
            <a href="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Go to Login</a>
          </div>
        </body>
      </html>
    );
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <DarkModeToggle />
        {/* Hide navigation header on event page if not logged in */}
        {!(currentPath.startsWith('/dashboard/events/') && !isLoggedIn) && (
          <nav className="w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
              {/* Logo and Brand */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white text-2xl font-bold shadow">AI</span>
                <span className="font-extrabold text-xl sm:text-2xl text-blue-700 dark:text-blue-300 tracking-wide">TestAI</span>
              </div>
              {/* Navigation Links */}
              <div className="flex gap-2 sm:gap-6">
                {navLinks.map(link => {
                  const isActive = currentPath === link.href;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`relative px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300'}`}
                    >
                      {link.label}
                      {isActive && <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-500 transition-transform origin-left"></span>}
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}
