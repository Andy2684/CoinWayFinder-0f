<<<<<<< HEAD
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Coinwayfinder - AI-Powered Crypto Trading Platform",
  description:
    "Advanced cryptocurrency trading platform with AI-powered signals, automated bots, and real-time market analysis.",
    generator: 'v0.dev'
=======
import './globals.css'

export const metadata = {
  title: 'CoinWayfinder',
  description: 'AI платформа для криптотрейдинга',
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
=======
    <html lang="ru">
      <body>{children}</body>
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
    </html>
  )
}
