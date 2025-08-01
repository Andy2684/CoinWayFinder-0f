"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, ArrowRight, Shield, TrendingUp, Users, Clock } from "lucide-react"

export default function ThankYouPage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/auth/login")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Trading Bots",
      description: "AI-powered bots that trade 24/7",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds and data are protected",
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Learn from experienced traders",
    },
  ]

  const nextSteps = [
    {
      step: 1,
      title: "Verify Your Email",
      description: "Check your inbox and click the verification link",
      icon: Mail,
    },
    {
      step: 2,
      title: "Complete Your Profile",
      description: "Add your trading preferences and experience level",
      icon: Users,
    },
    {
      step: 3,
      title: "Start Trading",
      description: "Connect your exchange and create your first bot",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Success Card */}
        <Card className="text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to CoinWayFinder! 🎉
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Your account has been created successfully
              </CardDescription>
            </div>
            <Badge variant="secondary" className="mx-auto bg-green-100 text-green-700 border-green-200">
              Account Created
            </Badge>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Email Verification Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-semibold text-blue-900">Check Your Email</h3>
                  <p className="text-sm text-blue-700">
                    We've sent a verification link to your email address. Please verify your account to get started.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">What's Next?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                    <feature.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Getting Started</h3>
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <step.icon className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Link href="/auth/login">
                  Sign In Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <p>
                You'll be automatically redirected to sign in in{" "}
                <span className="font-semibold text-blue-600">{countdown}</span> seconds
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <p className="text-sm text-gray-600">
                If you don't receive the verification email, check your spam folder or{" "}
                <Link href="/support" className="text-blue-600 hover:text-blue-700 underline">
                  contact our support team
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
