import './globals.css'
import { AuthProvider } from '../context/auth-context'
import Navigation from '@/components/navigation'

export const metadata = {
  title: 'CoinWayFinder',
  description: 'AI Crypto Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
