import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { Suspense } from "react"

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!name || !domain) return email
  const maskedName = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name.at(-1)
  return `${maskedName}@${domain}`
}

function ResendClient({ email }: { email: string }) {
  "use client"
  const [loading, setLoading] = require("react").useState(false)
  const [result, setResult] = require("react").useState<null | { ok: boolean; message: string }>(null)

  async function resend() {
    try {
      setLoading(true)
      setResult(null)
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult({ ok: true, message: data.message || "Verification email sent." })
      } else {
        setResult({ ok: false, message: data.error || "Failed to resend verification email." })
      }
    } catch {
      setResult({ ok: false, message: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sent to: {maskEmail(email)}</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={resend} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Go to Sign In</Link>
        </Button>
      </div>
      {result && (
        <Alert variant={result.ok ? "default" : "destructive"}>
          {result.ok ? <CheckCircle2 className="h-4 w-4" /> : null}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function AutoRedirect({ seconds = 10 }: { seconds?: number }) {
  "use client"
  const [remaining, setRemaining] = require("react").useState(seconds)
  const router = require("next/navigation").useRouter()

  require("react").useEffect(() => {
    const t = setInterval(() => setRemaining((s: number) => s - 1), 1000)
    return () => clearInterval(t)
  }, [])

  require("react").useEffect(() => {
    if (remaining <= 0) router.push("/auth/login")
  }, [remaining, router])

  return (
    <p className="text-xs text-muted-foreground">{`You will be redirected to Sign In in ${Math.max(0, remaining)}s.`}</p>
  )
}

export default function ThankYouPage() {
  const email = cookies().get("pending_verification_email")?.value || ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Thanks for signing up!</CardTitle>
          <CardDescription>We just sent a verification link to your email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Please verify your email address to activate your account. This helps us keep your account secure.
          </p>

          {email ? (
            <Suspense fallback={<div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</div>}>
              {/* Client-only resend UI */}
              {/* @ts-expect-error Server/Client boundary */}
              <ResendClient email={email} />
            </Suspense>
          ) : (
            <Alert>
              <AlertDescription>
                We couldn't detect your email from this session. If you just signed up, please check your inbox. Otherwise,
                go back to the signup page and try again.
              </AlertDescription>
            </Alert>
          )}

          <AutoRedirect seconds={10} />
        </CardContent>
      </Card>
    </div>
  )
}
