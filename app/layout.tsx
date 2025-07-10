import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { ClientLayout } from "./ClientLayout"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoinWayFinder - AI-Powered Crypto Trading Platform",
  description:
    "Automate your cryptocurrency trading with advanced AI algorithms, real-time market analysis, and professional-grade risk management.",
  keywords: "cryptocurrency, trading, AI, automation, bitcoin, ethereum, DeFi",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ErrorBoundary>
          <ClientLayout>
            <Navigation />
            <main className="pt-20">{children}</main>
            <Toaster />
          </ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}
