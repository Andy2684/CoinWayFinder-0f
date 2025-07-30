"use client"

import { RealTimeUserProfile } from "@/components/user/real-time-user-profile"
import { AuthProvider } from "@/hooks/use-auth"

export default function RealTimeProfilePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <RealTimeUserProfile />
      </div>
    </AuthProvider>
  )
}
