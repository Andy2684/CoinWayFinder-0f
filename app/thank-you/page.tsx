"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Mail, Shield, TrendingUp, Bot, Bell, ArrowRight, Clock, Star, Users, Zap } from "lucide-react"

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
      icon: Bot,
      title: "AI Trading Bots",
      description: "Deploy intelligent bots that trade 24/7",
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Advanced market analysis and insights",
      color: "text-green-600",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "Bank-level security for your assets",
      color: "text-purple-600",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Never miss important market movements",
      color: "text-orange-600",
    },
  ]

  const nextSteps = [
    {
      step: 1,
      title: "Check Your Email",
      description: "We've sent a verification link to your email address",
      icon: Mail,
      status: "pending",
    },
    {
      step: 2,
      title: "Verify Your Account",
      description: "Click the verification link to activate your account",
      icon: CheckCircle,
      status: "pending",
    },
    {
      step: 3,
      title: "Complete Your Profile",
      description: "Set up your trading preferences and risk settings",
      icon: Users,
      status: "upcoming",
    },
    {
      step: 4,
      title: "Start Trading",
      description: "Deploy your first AI trading bot and begin earning",
      icon: Zap,
      status: "upcoming",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Main Success Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-8">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to CoinWayFinder! 🎉
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 max-w-md mx-auto">
              Your account has been created successfully. You're now part of the future of crypto trading.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Account Status */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Account Status</h3>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Clock className="w-3 h-3 mr-1" />
                  Verification Pending
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">
                We've sent a verification email to your registered email address. Please check your inbox and click the
                verification link to activate your account.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="w-4 h-4 mr-2" />
                Didn't receive the email? Check your spam folder or contact support.
              </div>
            </div>

            {/* What's Next */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                What's Next?
              </h3>
              <div className="grid gap-4">
                {nextSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.status === "pending"
                          ? "bg-blue-100 text-blue-600"
                          : step.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <step.icon
                          className={`w-4 h-4 ${
                            step.status === "pending"
                              ? "text-blue-600"
                              : step.status === "completed"
                                ? "text-green-600"
                                : "text-gray-400"
                          }`}
                        />
                        <h4 className="font-medium text-gray-800">{step.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Features Preview */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-500" />
                What You'll Get Access To
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5"
              >
                <Link href="/auth/login" className="flex items-center">
                  Sign In Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button variant="outline" asChild className="px-8 py-2.5 bg-transparent">
                <Link href="/">Back to Homepage</Link>
              </Button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                You'll be automatically redirected to the sign-in page in{" "}
                <span className="font-semibold text-blue-600">{countdown}</span> seconds
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">Our support team is here to help you get started with CoinWayFinder.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/docs">View Documentation</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/community">Join Community</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
