"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = useMemo(() => params.get("token"), [params])
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    async function verify() {
      if (!token) {
        setStatus("error")
        setMessage("Missing verification token")
        return
      }
      setStatus("loading")
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { method: "GET" })
        const data = await res.json()
        if (!cancelled) {
          if (res.ok && data.success) {
            setStatus("success")
            setMessage("Your email has been verified. You can now log in.")
          } else {
            setStatus("error")
            setMessage(data.error || "Verification failed")
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("error")
          setMessage("Verification failed")
        }
      }
    }
    verify()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription className="text-slate-200/80">
            {status === "idle" && "Preparing verification..."}
            {status === "loading" && "Verifying your token..."}
            {status !== "loading" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" aria-label="Verifying" />}
          {status === "success" && <CheckCircle2 className="h-6 w-6 text-emerald-400" aria-label="Success" />}
          {status === "error" && <AlertTriangle className="h-6 w-6 text-yellow-400" aria-label="Error" />}

          <div className="flex gap-3">
            <Button onClick={() => router.push("/auth/login")} className="bg-purple-600 hover:bg-purple-700">
              Go to Login
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="border-white/20 text-white">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
