"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token provided")
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
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
    // This would need the user's email - in a real app, you might store this in localStorage
    // or require the user to enter their email again
    setMessage("Please contact support to resend verification email")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
              <CardDescription>Your email has been successfully verified</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Verification Failed</CardTitle>
              <CardDescription>There was a problem verifying your email</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className={status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {status === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Mail className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {status === "success" && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">You can now log in to your account</p>
              <p className="text-xs text-gray-500">Redirecting to login page in 3 seconds...</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-2">
              <Button variant="outline" onClick={resendVerification} className="w-full bg-transparent">
                Request New Verification Email
              </Button>
              <p className="text-xs text-gray-500">If you continue to have problems, please contact our support team</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
