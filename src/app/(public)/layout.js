"use client"
import '../globals.css'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  PlusCircleIcon, 
  UsersIcon, 
  ChartBarIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'

function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
      aria-label="Toggle dark mode"
    >
      <SunIcon className={`h-5 w-5 transition-all duration-300 ${dark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <MoonIcon className={`absolute top-3 left-3 h-5 w-5 transition-all duration-300 ${dark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
    </button>
  )
}

export default function RootLayout ({ children }) {
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/dashboard/events/new', label: 'New Event', icon: PlusCircleIcon },
    { href: '/dashboard/all-signins', label: 'All Sign-Ins', icon: UsersIcon },
    { href: '/dashboard/analytics', label: 'Analytics', icon: ChartBarIcon }
  ];
  
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show navigation on login page or sign-in pages
  const shouldShowNav = !pathname?.includes('/login') && !pathname?.startsWith('/s/');

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="gradient-bg min-h-screen transition-colors duration-300">
        <DarkModeToggle />
        
        {/* Navigation header - only show when appropriate */}
        {shouldShowNav && (
          <nav className="glass-effect sticky top-0 z-40 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo and Brand */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white text-2xl font-bold shadow-lg flex items-center justify-center">
                      AI
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-wide">
                      TestAI
                    </span>
                  </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map(link => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation */}
              {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 slide-up">
                  <div className="flex flex-col gap-2">
                    {navLinks.map(link => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}
        
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
