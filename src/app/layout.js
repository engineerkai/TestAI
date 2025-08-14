import './globals.css'

export const metadata = {
  title: 'Visitor Register',
  description: 'Open house QR sign-in and lead capture'
}

export default function RootLayout ({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  )
}
