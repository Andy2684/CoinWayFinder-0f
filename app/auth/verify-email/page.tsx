"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(3)
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email for the correct link.")
      return
    }

    verifyEmail(token)
  }, [token])

  // Countdown and redirect after successful verification
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === "success" && countdown === 0) {
      router.push("/dashboard")
    }
  }, [status, countdown, router])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)

        // Auto-login user
        if (data.token) {
          localStorage.setItem("auth_token", data.token)
        }
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)

    try {
      // You would need to implement this endpoint or get email from somewhere
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "user@example.com" }), // This should come from somewhere
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.")
      } else {
        setMessage(data.error || "Failed to resend verification email")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            {status === "loading" && (
              <div className="bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>

          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address."}
            {status === "success" && "Your account has been successfully activated."}
            {status === "error" && "There was a problem verifying your email address."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert
            className={
              status === "success"
                ? "border-green-200 bg-green-50"
                : status === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
            }
          >
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "success" && <CheckCircle className="h-4 w-4" />}
            {status === "error" && <XCircle className="h-4 w-4" />}
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Redirecting to dashboard in {countdown} seconds...</p>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Need help? Try these options:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full bg-transparent"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>

                  <Link href="/auth/signup">
                    <Button variant="ghost" size="sm" className="w-full">
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
