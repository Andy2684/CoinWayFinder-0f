"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Trophy, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ThankYouPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {Math.random() > 0.5 ? "🎉" : "✨"}
            </div>
          ))}
        </div>
      )}

      <Card className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Welcome to CoinWayFinder! 🎉</CardTitle>
          <CardDescription className="text-xl text-gray-300">
            Your account has been created successfully
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Achievement Unlocked */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-semibold text-white">Achievement Unlocked!</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center text-2xl">
                🚀
              </div>
              <div>
                <h3 className="font-bold text-white">Welcome Aboard</h3>
                <p className="text-sm text-gray-300">Successfully created your CoinWayFinder account</p>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400 mt-1">
                  +10 XP
                </Badge>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              What's Next?
            </h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-white">Verify Your Email</p>
                  <p className="text-sm text-gray-400">Check your inbox for a verification email</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-white">Complete Your Profile</p>
                  <p className="text-sm text-gray-400">Set up your trading preferences and goals</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-white">Explore Features</p>
                  <p className="text-sm text-gray-400">Discover trading bots, signals, and market analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/onboarding" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
              >
                Explore Platform
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-sm text-gray-400">
              Need help getting started?{" "}
              <Link href="/help" className="text-blue-400 hover:text-blue-300">
                Visit our Help Center
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
