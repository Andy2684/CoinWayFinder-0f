"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const SignupForm = dynamic(() => import("@/components/auth/signup-form").then((mod) => ({ default: mod.SignupForm })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white text-sm">Loading registration form...</p>
      </div>
    </div>
  ),
})

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-sm">Loading registration form...</p>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
