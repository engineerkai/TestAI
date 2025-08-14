"use client"
import './globals.css'

// export const metadata = {
//   title: 'Visitor Register',
//   description: 'Open house QR sign-in and lead capture'
// }

import { useEffect, useState } from 'react'

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <DarkModeToggle />
        {children}
      </body>
    </html>
  )
}
