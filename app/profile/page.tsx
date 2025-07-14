"use client"

import { ProfilePage } from "@/components/profile/profile-page"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
