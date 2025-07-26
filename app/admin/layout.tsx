"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: "BarChart3" },
  { name: "Email Queue", href: "/admin/email-queue", icon: "Mail" },
  { name: "Users", href: "/admin/users", icon: "Users" },
  { name: "Settings", href: "/admin/settings", icon: "Settings" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900">
        <AdminSidebar navigation={adminNavigation} />
        <div className="lg:pl-64">
          <AdminHeader />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
