"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Rocket, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

export function CTASection() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl border border-white/10" />

        <div className="relative z-10 p-12">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 bg-rocket-500/20 text-orange-300 border-orange-500/30">
            <Rocket className="w-4 h-4 mr-2" />
            Ready to Launch
          </Badge>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {!mounted || loading ? (
              "Loading..."
            ) : user ? (
              <>
                Welcome Back!
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
                  Continue Your Trading Journey
                </span>
              </>
            ) : (
              <>
                Start Your Trading Journey
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
                  Today
                </span>
              </>
            )}
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {!mounted || loading
              ? "Loading your personalized experience..."
              : user
                ? "Access your dashboard to monitor your bots, check performance, and optimize your trading strategies."
                : "Join thousands of successful traders who trust our AI-powered platform to maximize their crypto profits. Start your free trial today - no credit card required."}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold">98.7% Success Rate</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Bank-Grade Security</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">24/7 Trading</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!mounted || loading ? (
              <>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4" disabled>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Loading...
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
                  disabled
                >
                  Loading...
                </Button>
              </>
            ) : user ? (
              <>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
                >
                  <Link href="/bots">Manage Bots</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  <Link href="/auth/signup">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          {(!mounted || loading || !user) && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm mb-4">No credit card required • 14-day free trial • Cancel anytime</p>
              <div className="flex justify-center items-center space-x-6 opacity-60">
                <div className="text-white text-sm">🔒 SSL Secured</div>
                <div className="text-white text-sm">⚡ Instant Setup</div>
                <div className="text-white text-sm">📱 Mobile Ready</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
