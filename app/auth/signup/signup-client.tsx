"use client"

import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"

function SignupFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            {/* Header Skeleton */}
            <div className="text-center mb-8">
              <div className="h-8 bg-white/20 rounded-lg mb-4 animate-pulse" />
              <div className="h-4 bg-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              </div>
              <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-12 bg-white/10 rounded-lg animate-pulse" />

              {/* Password Requirements Skeleton */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/10 rounded-full animate-pulse" />
                    <div className="h-3 bg-white/10 rounded flex-1 animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Button Skeleton */}
              <div className="h-12 bg-blue-500/30 rounded-lg animate-pulse" />

              {/* Footer Skeleton */}
              <div className="text-center">
                <div className="h-4 bg-white/10 rounded-lg animate-pulse" />
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
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  )
}

export { SignupClient }
