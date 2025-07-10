import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoinWayfinder - Smart AI-Powered Crypto Trading Assistant",
  description:
    "Get real-time crypto signals, automated DCA bots, and AI-driven market analysis delivered directly to your Telegram. Start trading smarter with CoinWayfinder.",
  keywords: "crypto trading, AI signals, DCA bots, telegram bot, crypto analysis, trading assistant",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
