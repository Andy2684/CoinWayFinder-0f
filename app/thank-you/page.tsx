import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { Suspense } from "react"
import ResendVerificationClient from "./resend-client"

export const metadata = {
  title: "Thank you for signing up",
  description: "Please verify your email address to activate your account.",
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!name || !domain) return email
  const maskedName = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name.at(-1)
  return `${maskedName}@${domain}`
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

export default async function ThankYouPage() {
  const email = cookies().get("pending_verification_email")?.value || ""

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>We sent a verification link to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We&apos;ve sent a verification email{email ? ` to ${email}` : ""}. Please click the link in the email to
            verify your account. This helps us secure your account and confirm it&apos;s really you.
          </p>
          <Suspense fallback={null}>
            <ResendVerificationClient initialEmail={email} />
          </Suspense>
          <AutoRedirect seconds={10} />
        </CardContent>
      </Card>
    </main>
  )
}
