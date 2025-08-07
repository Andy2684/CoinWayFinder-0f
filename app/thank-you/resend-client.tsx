"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Mail } from 'lucide-react'

export default function ResendVerificationClient({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = "/auth/login"
    }
  }, [countdown])

  async function resend() {
    setIsLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to resend verification email.")
      } else if (data?.alreadyVerified) {
        setMessage("Your email is already verified. You can sign in now.")
      } else {
        setMessage("Verification email sent. Please check your inbox.")
      }
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {!initialEmail && (
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-md border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
      <Button onClick={resend} disabled={isLoading || !email}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" /> Resend verification email
          </>
        )}
      </Button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">Redirecting to Sign in in {countdown}s...</p>
    </div>
  )
}
