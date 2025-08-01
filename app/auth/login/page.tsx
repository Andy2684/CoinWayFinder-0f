"use client"

import { LoginForm } from "@/components/auth/login-form"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <LoginForm />
      </div>
      <FloatingDashboardButton />
    </div>
  )
}
