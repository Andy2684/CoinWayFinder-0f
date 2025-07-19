import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <DashboardHeader />
        <div className="flex flex-1">
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
