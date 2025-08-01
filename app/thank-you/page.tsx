"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Mail,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Shield,
  Bot,
  BarChart3,
  AlertTriangle,
  Clock,
  Gift,
} from "lucide-react"

export default function ThankYouPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating Celebration Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-500" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Main Success Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-400 animate-pulse" />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">Welcome to CoinWayFinder! 🎉</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Your account has been created successfully. You're now part of our growing community of smart crypto
                traders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Status */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">Account Status</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    Email Verification Pending
                  </Badge>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  What's Next?
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <span className="text-white font-medium">Check Your Email</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      We've sent a verification link to your email address. Click it to activate your account.
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <span className="text-white font-medium">Complete Profile</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Set up your trading preferences and connect your favorite exchanges.
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <span className="text-white font-medium">Start Trading</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Create your first AI trading bot and start making smarter trades.
                    </p>
                  </div>
                </div>
              </div>

              {/* Welcome Offer */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Welcome Offer</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  As a new member, you get <strong className="text-blue-400">30 days of premium features</strong>{" "}
                  absolutely free! This includes advanced AI trading bots, real-time market analysis, and priority
                  support.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Offer expires in 7 days. Activate your account to claim!</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8 text-blue-400" />
                  <CardTitle className="text-white">AI Trading Bots</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3">
                  Create intelligent trading bots that work 24/7 to maximize your profits using advanced AI algorithms.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Average 23% monthly returns</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                  <CardTitle className="text-white">Market Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3">
                  Get real-time market insights, technical analysis, and sentiment data to make informed trading
                  decisions.
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-400">
                  <BarChart3 className="h-3 w-3" />
                  <span>99.2% accuracy rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-400" />
                  <CardTitle className="text-white">Risk Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3">
                  Advanced risk management tools to protect your investments with stop-loss, take-profit, and portfolio
                  diversification.
                </p>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <Shield className="h-3 w-3" />
                  <span>Bank-grade security</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3 text-center">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-white font-semibold">4.9/5 Rating</p>
                  <p className="text-gray-400 text-sm">From 12,000+ reviews</p>
                </div>
                <div className="space-y-2">
                  <Users className="h-8 w-8 text-blue-400 mx-auto" />
                  <p className="text-white font-semibold">50,000+ Users</p>
                  <p className="text-gray-400 text-sm">Active traders worldwide</p>
                </div>
                <div className="space-y-2">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto" />
                  <p className="text-white font-semibold">$2.5B+ Volume</p>
                  <p className="text-gray-400 text-sm">Traded this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
            >
              Sign In Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" asChild>
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              You'll be automatically redirected to the login page in{" "}
              <span className="text-blue-400 font-semibold">{countdown}</span> seconds
            </p>
          </div>

          {/* Support */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">Need help getting started?</p>
            <div className="flex justify-center gap-4 text-sm">
              <Link href="/help" className="text-blue-400 hover:text-blue-300">
                Help Center
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                Contact Support
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/docs" className="text-blue-400 hover:text-blue-300">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
