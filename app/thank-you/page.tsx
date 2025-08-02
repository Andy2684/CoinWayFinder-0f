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
  Sparkles,
  Shield,
  Bot,
  BarChart3,
  Users,
  DollarSign,
  Star,
  ArrowRight,
  Clock,
  MessageCircle,
  BookOpen,
  Zap,
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
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-400 animate-bounce" />
                <div className="absolute inset-0 w-20 h-20 bg-green-400/20 rounded-full animate-ping" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to CoinWayFinder! 🎉</h1>

            <p className="text-xl text-blue-100/80 mb-6">
              Your account has been created successfully. You're now part of the future of crypto trading!
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Mail className="w-4 h-4 mr-1" />
                Email Verification Pending
              </Badge>
            </div>
          </div>

          {/* Welcome Offer */}
          <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30 mb-8">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <CardTitle className="text-white text-2xl">Special Welcome Offer!</CardTitle>
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <CardDescription className="text-blue-100/80 text-lg">
                Get 30 days of premium features absolutely free as a welcome gift!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <Bot className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">AI Trading Bots</h4>
                  <p className="text-blue-100/70 text-sm">Advanced AI-powered trading strategies</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Premium Analytics</h4>
                  <p className="text-blue-100/70 text-sm">Real-time market insights and signals</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Risk Management</h4>
                  <p className="text-blue-100/70 text-sm">Advanced portfolio protection tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Check Your Email</h4>
                    <p className="text-blue-100/70 text-sm">
                      We've sent a verification link to your email address. Click it to activate your account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Complete Your Profile</h4>
                    <p className="text-blue-100/70 text-sm">
                      Set up your trading preferences and connect your first exchange account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Start Trading</h4>
                    <p className="text-blue-100/70 text-sm">
                      Create your first AI trading bot and begin your journey to automated profits.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/5 border-white/10 text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <h4 className="text-white font-semibold mb-1">4.9/5 Rating</h4>
                <p className="text-blue-100/70 text-sm">From 10,000+ traders</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-center">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold mb-1">50,000+ Users</h4>
                <p className="text-blue-100/70 text-sm">Active traders worldwide</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-center">
              <CardContent className="pt-6">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold mb-1">$2.5B+ Volume</h4>
                <p className="text-blue-100/70 text-sm">Traded through our platform</p>
              </CardContent>
            </Card>
          </div>

          {/* Support Resources */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-xl">Need Help Getting Started?</CardTitle>
              <CardDescription className="text-blue-100/70">
                Our support team is here to help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto p-4 flex flex-col items-center gap-2"
                >
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <span className="font-semibold">Help Center</span>
                  <span className="text-xs text-blue-100/70">Comprehensive guides</span>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto p-4 flex flex-col items-center gap-2"
                >
                  <MessageCircle className="w-6 h-6 text-green-400" />
                  <span className="font-semibold">Live Chat</span>
                  <span className="text-xs text-blue-100/70">24/7 support available</span>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span className="font-semibold">Quick Start</span>
                  <span className="text-xs text-blue-100/70">5-minute setup guide</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
              >
                <Link href="/auth/login">
                  Sign In to Your Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button
                variant="outline"
                asChild
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
              >
                <Link href="/">Explore Features</Link>
              </Button>
            </div>

            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <p className="text-blue-100/80 text-sm mb-2">
                Redirecting to login page in <span className="font-bold text-white">{countdown}</span> seconds
              </p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
