"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import DashboardClient from "./dashboard-client"

export default function DashboardWrapper() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardClient />
    </ProtectedRoute>
  )
}
