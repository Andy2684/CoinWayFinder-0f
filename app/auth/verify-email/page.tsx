"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verificationToken = searchParams.get("token")
    setToken(verificationToken)

    if (verificationToken) {
      verifyEmail(verificationToken)
    } else {
      setStatus("error")
      setMessage("Invalid verification link")
    }
  }, [searchParams])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)

        // Auto-login user if token is provided
        if (data.token) {
          localStorage.setItem("auth_token", data.token)
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
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

  const resendVerification = async () => {
    setIsResending(true)
    try {
      // You would need to implement a way to get the email
      // For now, we'll show a message to contact support
      setMessage("Please contact support to resend verification email")
    } catch (error) {
      setMessage("Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191A1E] p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "loading" && (
              <div className="bg-blue-500/10">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-500/10">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-500/10">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-bold text-white">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>

          <CardDescription className="text-gray-400">
            {status === "loading" && "Please wait while we verify your email address"}
            {status === "success" && "Your account has been successfully activated"}
            {status === "error" && "There was a problem verifying your email"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert
              className={`${
                status === "success"
                  ? "border-green-500/20 bg-green-500/10"
                  : status === "error"
                    ? "border-red-500/20 bg-red-500/10"
                    : "border-blue-500/20 bg-blue-500/10"
              }`}
            >
              <AlertDescription
                className={`${
                  status === "success" ? "text-green-300" : status === "error" ? "text-red-300" : "text-blue-300"
                }`}
              >
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {status === "success" && (
              <>
                <p className="text-center text-gray-300 text-sm">Redirecting to dashboard in 3 seconds...</p>
                <Link href="/dashboard">
                  <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <Button
                  onClick={resendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  {isResending ? (
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

                <Link href="/auth/signup">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Back to Registration
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
                    Go to Login
                  </Button>
                </Link>
              </>
            )}

            {status === "loading" && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">This may take a few moments...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
