"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from 'lucide-react'

export default function ResendClient({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  async function onResend() {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult({ type: "success", message: "Verification email has been resent." })
      } else {
        setResult({ type: "error", message: data.error || "Failed to resend email." })
      }
    } catch {
      setResult({ type: "error", message: "Failed to resend email." })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={onResend} disabled={sending} className="bg-purple-600 hover:bg-purple-700">
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resending...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Resend Verification Email
          </>
        )}
      </Button>
      {result && (
        <Alert className={result.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" : "bg-red-500/10 border-red-500/20 text-red-200"}>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
