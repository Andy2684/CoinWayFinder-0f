"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Bot, TrendingUp, Shield, Zap, Star, Play, UserPlus, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const { user } = useAuth()

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
            <Bot className="w-4 h-4 mr-2" />
            AI-Powered Trading Revolution
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Smarter with
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              AI Trading Bots
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Automate your crypto trading with intelligent bots that never sleep. Maximize profits while minimizing risks
            with our advanced AI algorithms.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$2.5M+</div>
              <div className="text-gray-400">Trading Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">15,000+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-gray-400">Automated Trading</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
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
              <>
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
              </>
            )}
          </div>

          {/* Email Signup */}
          {!user && (
            <div className="max-w-md mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                />
                <Button
                  asChild
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold whitespace-nowrap"
                >
                  <Link href={`/auth/signup?email=${encodeURIComponent(email)}`}>Get Started</Link>
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-2">Free 14-day trial • No credit card required</p>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-blue-400" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>

        {/* Demo Video/Image */}
        <div className="mt-20 relative">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10">
              <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-6 backdrop-blur-sm"
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Live Trading
            </div>
            <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              +24.5% Today
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="mt-16 text-center">
            <p className="text-gray-300 mb-6">Join thousands of successful traders</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8"
              >
                <Link href="/auth/signup" className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Free Account
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
                  Member Login
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
