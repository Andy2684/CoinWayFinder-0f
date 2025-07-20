"use client"
import { LoginForm } from "@/components/auth/login-form"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 pt-4">
        <BackToDashboard />
      </div>
      <LoginForm />
    </div>
  )
}
