"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Mail,
  ArrowRight,
  Bot,
  TrendingUp,
  Shield,
  Star,
  Users,
  DollarSign,
  Sparkles,
  Gift,
  HelpCircle,
  MessageCircle,
  BookOpen,
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
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to CoinWayFinder! 🎉</h1>
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Your account has been successfully created. You're now part of the future of crypto trading!
            </p>
          </div>

          {/* Account Status */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Account Status</h3>
                    <p className="text-white/70">Email verification pending</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                  Verification Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Offer */}
          <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg border-purple-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">🎁 Welcome Offer</h3>
                  <p className="text-white/80">
                    Get 30 days of premium features absolutely free! Start with advanced AI bots and market analysis.
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Check Your Email</h4>
                    <p className="text-white/70 text-sm">
                      We've sent a verification link to your email. Click it to activate your account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Complete Your Profile</h4>
                    <p className="text-white/70 text-sm">
                      Set up your trading preferences and connect your favorite exchanges.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Start Trading</h4>
                    <p className="text-white/70 text-sm">
                      Launch your first AI bot and begin your journey to smarter crypto trading.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">What You'll Get</h2>
              <div className="space-y-4">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Bot className="w-8 h-8 text-blue-400" />
                      <div>
                        <h4 className="text-white font-medium">AI Trading Bots</h4>
                        <p className="text-white/70 text-sm">Automated trading with advanced AI algorithms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                      <div>
                        <h4 className="text-white font-medium">Market Analysis</h4>
                        <p className="text-white/70 text-sm">Real-time insights and predictive analytics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium">Risk Management</h4>
                        <p className="text-white/70 text-sm">Advanced tools to protect your investments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white font-semibold">4.9/5 Rating</p>
                  <p className="text-white/70 text-sm">From 10,000+ users</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">50K+</span>
                  </div>
                  <p className="text-white font-semibold">Active Traders</p>
                  <p className="text-white/70 text-sm">Growing community</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <span className="text-2xl font-bold text-white">$2B+</span>
                  </div>
                  <p className="text-white font-semibold">Trading Volume</p>
                  <p className="text-white/70 text-sm">Processed monthly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Resources */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 mb-8">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">Need Help Getting Started?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/help"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Help Center</p>
                    <p className="text-white/70 text-xs">FAQs and guides</p>
                  </div>
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Live Chat</p>
                    <p className="text-white/70 text-xs">24/7 support</p>
                  </div>
                </Link>

                <Link
                  href="/docs"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Documentation</p>
                    <p className="text-white/70 text-xs">Complete guides</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-white/70 text-sm">
              Redirecting automatically in <span className="font-bold text-blue-400">{countdown}</span> seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
