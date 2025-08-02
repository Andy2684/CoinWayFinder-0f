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
  Star,
  Users,
  TrendingUp,
  Shield,
  Bot,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Clock,
  MessageCircle,
  BookOpen,
  Sparkles,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to CoinWayFinder! 🎉</h1>
          <p className="text-xl text-gray-300 mb-4">Your account has been created successfully</p>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Mail className="w-4 h-4 mr-2" />
            Email verification pending
          </Badge>
        </div>

        {/* Welcome Offer */}
        <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
              <CardTitle className="text-white">Special Welcome Offer</CardTitle>
              <Sparkles className="w-6 h-6 text-yellow-400 ml-2" />
            </div>
            <CardDescription className="text-gray-300">
              Get 30 days of premium features absolutely free!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <Bot className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">AI Trading Bots</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Advanced Analytics</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Risk Management</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">$99 value - FREE for 30 days</Badge>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="text-white font-medium">Check Your Email</h3>
                <p className="text-gray-300 text-sm">
                  We've sent a verification link to your email address. Click it to activate your account.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="text-white font-medium">Complete Your Profile</h3>
                <p className="text-gray-300 text-sm">
                  Set up your trading preferences and connect your exchange accounts.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="text-white font-medium">Start Trading</h3>
                <p className="text-gray-300 text-sm">
                  Create your first AI trading bot and begin your automated trading journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <Bot className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI Trading Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Deploy intelligent bots that trade 24/7 using advanced algorithms and market analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Get real-time insights, technical indicators, and sentiment analysis for informed decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <Shield className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Protect your investments with advanced stop-loss, take-profit, and portfolio management tools.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <Card className="max-w-2xl mx-auto mb-8 bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-white font-bold">4.9/5</p>
                <p className="text-gray-400 text-sm">User Rating</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-white font-bold">50K+</p>
                <p className="text-gray-400 text-sm">Active Traders</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white font-bold">$2.5B+</p>
                <p className="text-gray-400 text-sm">Trading Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Resources */}
        <Card className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Need Help Getting Started?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" asChild>
                <Link href="/help">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Help Center
                </Link>
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" asChild>
                <Link href="/support">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Link>
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" asChild>
                <Link href="/docs">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto-redirect notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm">Redirecting to login in {countdown} seconds</span>
          </div>
          <div className="space-x-4">
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/auth/login">
                Sign In Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
