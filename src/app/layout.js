import './globals.css'

export const metadata = {
  title: 'Visitor Register',
  description: 'Open house QR sign-in and lead capture'
}

export default function RootLayout ({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
