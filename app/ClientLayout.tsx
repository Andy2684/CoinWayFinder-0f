"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Handle browser extension attributes that cause hydration mismatches
    const handleExtensionAttributes = () => {
      const html = document.documentElement
      // Remove any attributes that might be added by browser extensions
      const attributesToRemove = [
        "data-bybit-channel-name",
        "data-bybit-is-default-wallet",
        "data-metamask-installed",
        "data-coinbase-wallet-installed",
      ]

      attributesToRemove.forEach((attr) => {
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr)
        }
      })
    }

    // Run after hydration
    handleExtensionAttributes()

    // Set up observer to handle dynamically added attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.target === document.documentElement) {
          handleExtensionAttributes()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-bybit-channel-name",
        "data-bybit-is-default-wallet",
        "data-metamask-installed",
        "data-coinbase-wallet-installed",
      ],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CoinWayfinder - Smart AI-Powered Crypto Trading Assistant</title>
        <meta
          name="description"
          content="Get real-time crypto signals, automated DCA bots, and AI-driven market analysis delivered directly to your Telegram. Start trading smarter with CoinWayfinder."
        />
        <meta
          name="keywords"
          content="crypto trading, AI signals, DCA bots, telegram bot, crypto analysis, trading assistant"
        />
        <meta name="generator" content="v0.dev" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
