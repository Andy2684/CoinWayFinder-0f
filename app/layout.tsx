import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoinWayFinder - Advanced Crypto Trading Platform",
  description:
    "Professional cryptocurrency trading platform with AI-powered bots, real-time signals, and comprehensive portfolio management.",
  keywords: "cryptocurrency, trading, bitcoin, ethereum, trading bots, crypto signals, portfolio management",
  authors: [{ name: "CoinWayFinder Team" }],
  openGraph: {
    title: "CoinWayFinder - Advanced Crypto Trading Platform",
    description:
      "Professional cryptocurrency trading platform with AI-powered bots, real-time signals, and comprehensive portfolio management.",
    type: "website",
    url: "https://coinwayfinder.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinWayFinder - Advanced Crypto Trading Platform",
    description:
      "Professional cryptocurrency trading platform with AI-powered bots, real-time signals, and comprehensive portfolio management.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
