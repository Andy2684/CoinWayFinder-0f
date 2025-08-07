"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus("error")
        setError("Missing verification token.")
        return
      }
      setStatus("verifying")
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      const data = await res.json()
      if (res.ok && data.verified) {
        setStatus("success")
      } else {
        setStatus("error")
        setError(data?.error || "Invalid or expired token.")
      }
    }
    run()
  }, [token])

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Confirming your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "verifying" && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying your email...
            </div>
          )}
          {status === "success" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Your email has been verified successfully.</span>
              </div>
              <Button className="w-full" onClick={() => router.push("/auth/login")}>
                Continue to Sign in
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>{error || "Verification failed."}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                You can request a new verification email from the Thank You page after signup.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
