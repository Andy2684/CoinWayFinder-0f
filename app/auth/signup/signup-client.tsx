"use client"

import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function SignupFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="space-y-1">
            <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
            <Skeleton className="h-4 w-64 mx-auto bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 bg-white/20" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-white/20" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 bg-white/20" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-white/20" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
            <Skeleton className="h-10 w-full bg-purple-500/30" />
            <div className="text-center">
              <Skeleton className="h-4 w-48 mx-auto bg-white/10" />
            </div>
          </CardContent>
        </Card>
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
