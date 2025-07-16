// app/layout.tsx
import { AuthProvider } from '../context/auth-context'

export const metadata = {
  title: 'CoinWayFinder',
  description: 'Your app description',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
