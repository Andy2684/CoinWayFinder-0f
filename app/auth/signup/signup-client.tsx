"use client"

import { Suspense } from "react"
import SignupForm from "@/components/auth/signup-form"
import { Skeleton } from "@/components/ui/skeleton"

function SignupFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            {/* Header Skeleton */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
                <Skeleton className="h-8 w-48 bg-white/20" />
              </div>
              <Skeleton className="h-4 w-64 mx-auto bg-white/20" />
            </div>

            {/* Form Skeleton */}
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-white/20" />
                  <Skeleton className="h-10 w-full bg-white/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-white/20" />
                  <Skeleton className="h-10 w-full bg-white/20" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
              </div>

              {/* Password Requirements */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Skeleton className="h-4 w-32 mb-3 bg-white/20" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded-full bg-white/20" />
                      <Skeleton className="h-3 w-48 bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
              </div>

              {/* Submit Button */}
              <Skeleton className="h-12 w-full bg-white/20" />

              {/* Sign In Link */}
              <div className="text-center">
                <Skeleton className="h-4 w-40 mx-auto bg-white/20" />
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
