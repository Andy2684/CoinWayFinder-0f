"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap, UserPlus, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Main CTA */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Trading Experience?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful traders who are already using our AI-powered platform to maximize their profits
            and minimize their risks.
          </p>

          {user ? (
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              <Link href="/dashboard" className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Link href="/auth/signup" className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Start Trading Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 bg-transparent"
              >
                <Link href="/auth/login" className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          )}

          <p className="text-gray-400 text-sm">Free 14-day trial • No credit card required • Cancel anytime</p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Secure & Trusted</h3>
            <p className="text-gray-400">Bank-level security with 256-bit encryption</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Execute trades in milliseconds</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Proven Results</h3>
            <p className="text-gray-400">Average 24% monthly returns</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15,000+</div>
              <div className="text-gray-400">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$2.5M+</div>
              <div className="text-gray-400">Trading Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">Don't Miss Out on the Future of Trading</h3>
            <p className="text-gray-300 mb-6">Join the revolution and start trading with AI today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8"
              >
                <Link href="/auth/signup" className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Get Started Now
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30 px-8"
              >
                <Link href="/auth/login" className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Already a Member?
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
