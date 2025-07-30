"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ThankYouPage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Welcome to CoinWayFinder!</CardTitle>
          <CardDescription className="text-base">
            Your account has been created successfully. We're excited to have you on board!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Check Your Email</span>
            </div>
            <p className="text-sm text-blue-700">
              We've sent a verification email to your inbox. Please verify your email address to activate all features.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's Next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Verify Your Email</p>
                  <p className="text-sm text-muted-foreground">Click the link in your email to activate your account</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Explore Features</p>
                  <p className="text-sm text-muted-foreground">
                    Discover our trading bots, signals, and market analysis tools
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Start Trading</p>
                  <p className="text-sm text-muted-foreground">Connect your exchange and begin automated trading</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full" size="lg">
                <ArrowRight className="w-4 h-4 mr-2" />
                Sign In to Your Account
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="w-4 h-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">Redirecting to homepage in {countdown} seconds...</div>
        </CardContent>
      </Card>
    </div>
  )
}
