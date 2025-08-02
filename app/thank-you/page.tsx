"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Bot,
  BarChart3,
  Users,
  DollarSign,
  Star,
  ArrowRight,
  Clock,
  Gift,
  Zap,
  Target,
  BookOpen,
  MessageCircle,
  HelpCircle,
} from "lucide-react"

export default function ThankYouPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [progress, setProgress] = useState(0)

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

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + 10
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(progressTimer)
    }
  }, [router])

  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Advanced algorithms that trade 24/7",
      color: "text-blue-400",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live market data and performance metrics",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Automated stop-loss and portfolio protection",
      color: "text-purple-400",
    },
    {
      icon: TrendingUp,
      title: "Smart Signals",
      description: "AI-powered trading signals and alerts",
      color: "text-orange-400",
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Verify Your Email",
      description: "Check your inbox for a verification link",
      completed: false,
    },
    {
      number: 2,
      title: "Complete Your Profile",
      description: "Add your trading preferences and experience",
      completed: false,
    },
    {
      number: 3,
      title: "Connect Exchange",
      description: "Link your preferred crypto exchange",
      completed: false,
    },
    {
      number: 4,
      title: "Start Trading",
      description: "Deploy your first AI trading bot",
      completed: false,
    },
  ]

  const trustIndicators = [
    { icon: Users, value: "50K+", label: "Active Traders" },
    { icon: DollarSign, value: "$2.5B+", label: "Trading Volume" },
    { icon: Star, value: "4.9/5", label: "User Rating" },
    { icon: Shield, value: "99.9%", label: "Uptime" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-400" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              CoinWayFinder
            </span>
            !
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your account has been created successfully. Get ready to revolutionize your crypto trading with AI-powered
            automation.
          </p>

          {/* Welcome Offer */}
          <Card className="max-w-md mx-auto mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                  Welcome Offer
                </Badge>
              </div>
              <CardTitle className="text-white text-lg">30 Days Premium Features</CardTitle>
              <CardDescription className="text-gray-300">
                Unlock advanced AI bots, premium signals, and priority support
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Offer expires in:</span>
                <span className="font-mono text-yellow-400">23:59:45</span>
              </div>
            </CardContent>
          </Card>

          {/* Auto-redirect countdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm">Redirecting to login in {countdown}s</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
            <Button asChild variant="ghost" size="sm" className="w-full mt-2 text-blue-400 hover:text-blue-300">
              <Link href="/auth/login">
                Continue to Login <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Next Steps
              </CardTitle>
              <CardDescription className="text-gray-300">
                Complete these steps to get the most out of CoinWayFinder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.completed ? "bg-green-500 text-white" : "bg-white/20 text-white border-2 border-white/30"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="w-4 h-4" /> : step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Preview */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                What's Waiting for You
              </CardTitle>
              <CardDescription className="text-gray-300">Powerful features to supercharge your trading</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="text-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                    <h3 className="text-white font-medium text-sm mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-xs">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustIndicators.map((indicator, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-center">
              <CardContent className="p-4">
                <indicator.icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white mb-1">{indicator.value}</div>
                <div className="text-sm text-gray-400">{indicator.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Need Help Getting Started?</CardTitle>
            <CardDescription className="text-gray-300">Our support team is here to help you succeed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 bg-white/5 border-white/20 hover:bg-white/10">
                <div className="text-center">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-white font-medium">Help Center</div>
                  <div className="text-gray-400 text-sm">Guides & tutorials</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 bg-white/5 border-white/20 hover:bg-white/10">
                <div className="text-center">
                  <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-white font-medium">Live Chat</div>
                  <div className="text-gray-400 text-sm">24/7 support</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 bg-white/5 border-white/20 hover:bg-white/10">
                <div className="text-center">
                  <HelpCircle className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-white font-medium">Documentation</div>
                  <div className="text-gray-400 text-sm">API & integration</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
