"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Sparkles, TrendingUp, Shield, Bot, BarChart3, Users, DollarSign, Star, ArrowRight, Clock, Gift, Zap, Target, BookOpen, MessageCircle, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function ThankYouPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [progress, setProgress] = useState(0)
  const [seconds, setSeconds] = useState(10)

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

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (seconds === 0) {
      router.push("/auth/login")
    }
  }, [seconds, router])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-white/10 border-white/20 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-green-400" />
          </div>
          <CardTitle className="text-2xl">Welcome to CoinWayFinder!</CardTitle>
          <CardDescription className="text-blue-100/80">
            Your account was created successfully. You can sign in and start exploring.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/auth/login">
              Go to Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-blue-100/70">Redirecting to sign in in {seconds}s…</p>
        </CardContent>
      </Card>
    </div>
  )
}
