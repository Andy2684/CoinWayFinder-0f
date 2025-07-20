"use client"

import { SignupForm } from "@/components/auth/signup-form"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join CoinWayFinder and start trading smarter</p>
        </div>

        <SignupForm />

        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <FloatingDashboardButton />
    </div>
  )
}
