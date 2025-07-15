"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Mail, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("pending")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setStatus("loading")
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage("Your email has been verified successfully!")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Email verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191A1E] p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#30D5C8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "loading" ? (
              <Loader2 className="w-8 h-8 text-[#30D5C8] animate-spin" />
            ) : status === "success" ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : status === "error" ? (
              <AlertCircle className="w-8 h-8 text-red-400" />
            ) : (
              <Mail className="w-8 h-8 text-[#30D5C8]" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {status === "pending"
              ? "Check Your Email"
              : status === "loading"
                ? "Verifying..."
                : status === "success"
                  ? "Email Verified!"
                  : "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {status === "pending"
              ? "We've sent a verification link to your email address"
              : status === "loading"
                ? "Please wait while we verify your email"
                : status === "success"
                  ? "Your account has been successfully verified"
                  : "There was a problem verifying your email"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <Alert
              className={
                status === "success" ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"
              }
            >
              {status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={status === "success" ? "text-green-300" : "text-red-300"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "pending" && (
            <div className="text-center space-y-4">
              <p className="text-gray-300 text-sm">
                Please check your email and click the verification link to activate your account.
              </p>
              <p className="text-gray-400 text-xs">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <p className="text-green-300 text-sm mb-4">Redirecting to login page in 3 seconds...</p>
              <Button asChild className="bg-[#30D5C8] hover:bg-[#2BC4B9] text-black">
                <Link href="/auth/login">Continue to Login</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                <Link href="/auth/signup">Try Signing Up Again</Link>
              </Button>
              <Button asChild className="bg-[#30D5C8] hover:bg-[#2BC4B9] text-black">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          )}

          {status === "pending" && (
            <div className="text-center">
              <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
