"use client"

import type React from "react"
import { AuthProvider } from "@/hooks/use-auth"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/sonner"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>{children}</main>
        <Toaster />
      </div>
    </AuthProvider>
  )
}
