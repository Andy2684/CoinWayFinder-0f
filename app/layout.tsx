// app/layout.tsx
import "./globals.css"
import { ReactNode } from "react"

export const metadata = { title: "CoinWayfinder" }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: 16, backgroundColor: "#111" }}>
          <a href="/analytics" style={{ marginRight: 20 }}>Analytics</a>
          <a href="/login">Login</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
