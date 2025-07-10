import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RootErrorBoundary } from "@/components/error-boundaries/root-error-boundary"
import { initSentry } from "@/lib/sentry"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoinWayFinder - Advanced Crypto Trading Platform",
  description:
    "Professional cryptocurrency trading platform with automated bots, real-time analytics, and advanced trading strategies.",
  keywords: ["cryptocurrency", "trading", "bot", "automated", "crypto", "bitcoin", "ethereum"],
  authors: [{ name: "CoinWayFinder Team" }],
  creator: "CoinWayFinder",
  publisher: "CoinWayFinder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
    generator: 'v0.dev'
}

// Initialize Sentry
initSentry()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </RootErrorBoundary>
      </body>
    </html>
  )
}
