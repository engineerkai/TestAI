"use client"
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';  
import '../globals.css'

// export const metadata = {
//   title: 'Login',
//   description: 'Login to your account',
// }

export default function AuthLayout({ children }) {
  // Simple client-side auth check (cookie or localStorage)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  let currentPath = pathname;
  try {
    currentPath = usePathname ? usePathname() : pathname;
  } catch {}

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

  if (isLoggedIn && isSTokenPage)
  {
    redirect('/dashboard');
  }

  return (
    <html lang="en">
      <body>
        <div className="auth-container">
          {/* Login-specific styling/layout */}
          {children}
        </div>
      </body>
    </html>
  )
}