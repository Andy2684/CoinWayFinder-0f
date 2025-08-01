"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Mail,
  ArrowRight,
  Bot,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Star,
  Sparkles,
  ExternalLink,
  MessageCircle,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

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

  const nextSteps = [
    {
      icon: Mail,
      title: "Check Your Email",
      description: "We've sent a verification link to your email address. Click it to activate your account.",
      status: "pending",
    },
    {
      icon: Shield,
      title: "Secure Your Account",
      description: "Set up two-factor authentication for enhanced security.",
      status: "upcoming",
    },
    {
      icon: Bot,
      title: "Deploy Your First Bot",
      description: "Create and configure your first AI trading bot.",
      status: "upcoming",
    },
    {
      icon: TrendingUp,
      title: "Start Trading",
      description: "Begin your automated crypto trading journey.",
      status: "upcoming",
    },
  ]

  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Deploy intelligent bots that trade 24/7",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Advanced market analysis and insights",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security for your assets",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join thousands of successful traders",
    },
  ]

  const supportResources = [
    {
      icon: BookOpen,
      title: "Getting Started Guide",
      description: "Learn the basics of automated trading",
      link: "/docs/getting-started",
    },
    {
      icon: MessageCircle,
      title: "Community Forum",
      description: "Connect with other traders",
      link: "/community",
    },
    {
      icon: ExternalLink,
      title: "Video Tutorials",
      description: "Watch step-by-step tutorials",
      link: "/tutorials",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="container mx-auto max-w-4xl py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to CoinWayFinder! 🎉</h1>
          <p className="text-xl text-gray-300 mb-6">
            Your account has been created successfully. You're now part of the future of crypto trading.
          </p>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Account Created Successfully
          </Badge>
        </div>

        {/* Account Status */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-yellow-500/20 border-yellow-500/30">
              <Clock className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                <strong>Email Verification Pending:</strong> Please check your email and click the verification link to
                fully activate your account.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Your Next Steps</CardTitle>
            <CardDescription className="text-gray-300">
              Follow these steps to get the most out of CoinWayFinder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-white/5">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === "pending" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-gray-300 text-sm">{step.description}</p>
                  </div>
                  <div>
                    {step.status === "pending" && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">What You'll Get Access To</CardTitle>
            <CardDescription className="text-gray-300">
              Powerful tools and features to maximize your trading success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5">
                  <feature.icon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Resources */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Need Help Getting Started?</CardTitle>
            <CardDescription className="text-gray-300">
              Explore our resources to learn and connect with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {supportResources.map((resource, index) => (
                <Link
                  key={index}
                  href={resource.link}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <resource.icon className="w-6 h-6 text-blue-400 mb-3 group-hover:text-blue-300 transition-colors" />
                  <h3 className="font-semibold text-white mb-2 group-hover:text-blue-100 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-300 text-sm">{resource.description}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto Redirect Notice */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-gray-300 mb-4">
              You'll be automatically redirected to the login page in{" "}
              <span className="font-bold text-white">{countdown}</span> seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/auth/login" className="flex items-center">
                  Sign In Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="text-white ml-2 font-semibold">4.9/5</span>
          </div>
          <p className="text-gray-400">Trusted by over 50,000 traders worldwide</p>
        </div>
      </div>
    </div>
  )
}
