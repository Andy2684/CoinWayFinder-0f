"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { useEffect } from "react"
import { Toaster } from "sonner"
import { AuthProvider } from "@/hooks/use-auth"

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
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>{children}</main>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  )
}
