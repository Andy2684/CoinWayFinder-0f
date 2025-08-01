"use client"

import { Suspense } from "react"
import SignupForm from "@/components/auth/signup-form"

function SignupSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            {/* Header skeleton */}
            <div className="text-center mb-8">
              <div className="h-8 bg-white/20 rounded-lg mb-4 animate-pulse" />
              <div className="h-4 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto animate-pulse" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                  <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                </div>
                <div>
                  <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                  <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Email field */}
              <div>
                <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              </div>

              {/* Password field */}
              <div>
                <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              </div>

              {/* Password requirements */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="h-4 bg-white/20 rounded mb-3 animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                      <div className="h-3 bg-white/10 rounded flex-1 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              </div>

              {/* Submit button */}
              <div className="h-12 bg-blue-500/30 rounded-lg animate-pulse" />

              {/* Sign in link */}
              <div className="text-center">
                <div className="h-4 bg-white/10 rounded w-48 mx-auto animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupClient() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </Suspense>
  )
}

export { SignupClient }
