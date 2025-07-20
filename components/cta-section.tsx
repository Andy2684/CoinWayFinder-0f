"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
            <Zap className="h-3 w-3 mr-1" />
            Ready to Start?
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {user ? (
              <>
                Welcome Back!{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Continue Trading
                </span>
              </>
            ) : (
              <>
                Start Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Trading Journey
                </span>{" "}
                Today
              </>
            )}
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {user
              ? "Access your dashboard to manage your bots, view analytics, and continue maximizing your crypto profits."
              : "Join thousands of successful traders who trust CoinWayFinder to automate their crypto trading strategies."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <Shield className="h-6 w-6 text-green-400" />
              <span className="text-lg">Bank-level Security</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <span className="text-lg">Proven Results</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <Zap className="h-6 w-6 text-purple-400" />
              <span className="text-lg">Instant Setup</span>
            </div>
          </div>

          {/* Additional Info */}
          {!user && (
            <div className="mt-12 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
              <p className="text-gray-300 mb-4">
                <strong className="text-white">No credit card required</strong> • 7-day free trial • Cancel anytime
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span>✓ Access to all features</span>
                <span>✓ 24/7 customer support</span>
                <span>✓ Risk-free trial</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
